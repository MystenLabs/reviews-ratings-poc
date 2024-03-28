module poc::service {
    use std::string::String;

    use sui::balance::{Self, Balance};
    use sui::clock::Clock;
    use sui::coin::{Self, Coin};
    use sui::dynamic_field as df;
    use sui::object::{Self, ID, UID};
    use sui::sui::SUI;
    use sui::table::{Self, Table};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    use poc::multimap::{Self, MultiMap};
    use poc::review::{Self, Review};

    const EInvalidPermission: u64 = 1;
    const ENotEnoughBalance: u64 = 2;
    const EAlreadyExists: u64 = 3;
    const ENotExists: u64 = 4;
    const ENotDelisted: u64 = 5;

    const MAX_REVIEWERS_TO_REWARD: u64 = 10;

    /// A capability that can be used to perform admin operations on a service
    struct AdminCap has key, store {
        id: UID,
        service_id: ID
    }

    /// Represents a service
    struct Service has key, store {
        id: UID,
        reward_pool: Balance<SUI>,
        reward: u64,
        top_reviews: MultiMap<ID>,
        reviews: Table<ID, ID>,
        moderators: Table<address, address>,
        overall_rate: u64,
        name: String
    }

    /// Represents a proof of experience that can be used to write a review with higher score
    struct ProofOfExperience has key {
        id: UID,
        service_id: ID,
    }

    /// Represents a delisted review
    struct Delisted has key {
        id: UID,
        review_id: ID,
    }

    /// Represents a moderator that can be used to delete reviews
    struct Moderator has key {
        id: UID,
        service_id: ID,
    }

    /// Represents a review record
    struct ReviewRecord has store, drop {
        owner: address,
        overall_rate: u8,
        time_issued: u64,
    }

    /// Creates a new service
    public fun create_service(
        name: String,
        ctx: &mut TxContext,
    ): ID {
        let id = object::new(ctx);
        let service_id = object::uid_to_inner(&id);
        let service = Service {
            id,
            reward: 1000000,
            reward_pool: balance::zero(),
            reviews: table::new<ID, ID>(ctx),
            top_reviews: multimap::empty<ID>(),
            moderators: table::new<address, address>(ctx),
            overall_rate: 0,
            name
        };

        let admin_cap = AdminCap {
            id: object::new(ctx),
            service_id
        };

        transfer::share_object(service);
        transfer::public_transfer(admin_cap, tx_context::sender(ctx));
        service_id
    }

    /// Writes a new review
    public fun write_new_review(
        service: &mut Service,
        owner: address,
        content: String,
        overall_rate: u8,
        clock: &Clock,
        poe: ProofOfExperience,
        ctx: &mut TxContext
    ) {
        assert!(poe.service_id == object::uid_to_inner(&service.id), EInvalidPermission);
        let ProofOfExperience { id, service_id: _ } = poe;
        object::delete(id);
        let (id, total_score, time_issued) = review::new_review(
            owner,
            object::uid_to_inner(&service.id),
            content,
            true,
            overall_rate,
            clock,
            ctx
        );
        table::add<ID, ID>(&mut service.reviews, id, id);
        update_top_reviews(service, id, total_score);
        df::add<ID, ReviewRecord>(&mut service.id, id, ReviewRecord { owner, overall_rate, time_issued });
        let overall_rate = (overall_rate as u64);
        service.overall_rate = service.overall_rate + overall_rate;
    }

    /// Writes a new review without proof of experience
    public fun write_new_review_without_poe(
        service: &mut Service,
        owner: address,
        content: String,
        overall_rate: u8,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let (id, total_score, time_issued) = review::new_review(
            owner,
            object::uid_to_inner(&service.id),
            content,
            false,
            overall_rate,
            clock,
            ctx
        );
        table::add<ID, ID>(&mut service.reviews, id, id);
        update_top_reviews(service, id, total_score);
        df::add<ID, ReviewRecord>(&mut service.id, id, ReviewRecord { owner, overall_rate, time_issued });
        let overall_rate = (overall_rate as u64);
        service.overall_rate = service.overall_rate + overall_rate;
    }

    /// Returns true if top_reviews should be updated given a total score
    fun should_update_top_reviews(
        service: &Service,
        total_score: u64
    ): bool {
        let len = multimap::size<ID>(&service.top_reviews);
        if (len < MAX_REVIEWERS_TO_REWARD) {
            return true
        };
        let (_, last_priority) = multimap::get_entry_by_idx(&service.top_reviews, len - 1);
        if (total_score > *last_priority) {
            return true
        };
        false
    }

    /// Prunes top_reviews if it exceeds MAX_REVIEWERS_TO_REWARD
    fun prune_top_reviews(
        service: &mut Service
    ) {
        let len = multimap::size<ID>(&service.top_reviews);
        if (len > MAX_REVIEWERS_TO_REWARD) {
            let (last_review_id, _) = multimap::get_entry_by_idx(&service.top_reviews, len - 1);
            multimap::remove<ID>(&mut service.top_reviews, &*last_review_id);
        };
    }

    /// Updates top_reviews if necessary
    fun update_top_reviews(
        service: &mut Service,
        review_id: ID,
        total_score: u64
    ) {
        if (should_update_top_reviews(service, total_score)) {
            multimap::insert<ID>(&mut service.top_reviews, review_id, total_score);
            prune_top_reviews(service);
        };
    }

    /// Distributes rewards
    public fun distribute_reward(
        cap: &AdminCap,
        service: &mut Service,
        ctx: &mut TxContext
    ) {
        assert!(cap.service_id == object::uid_to_inner(&service.id), EInvalidPermission);
        // distribute a fixed amount to top MAX_REVIEWERS_TO_REWARD reviewers
        let len = multimap::size<ID>(&service.top_reviews);
        if (len > MAX_REVIEWERS_TO_REWARD) {
            len = MAX_REVIEWERS_TO_REWARD;
        };
        // check balance
        assert!(balance::value(&service.reward_pool) >= (service.reward * len), ENotEnoughBalance);
        let i = 0;
        while (i < len) {
            let sub_balance = balance::split(&mut service.reward_pool, service.reward);
            let reward = coin::from_balance(sub_balance, ctx);
            let (review_id, _) = multimap::get_entry_by_idx<ID>(&service.top_reviews, i);
            let record = df::borrow<ID, ReviewRecord>(&service.id, *review_id);
            transfer::public_transfer(reward, record.owner);
            i = i + 1;
        };
    }

    /// Adds coins to reward pool
    public fun top_up_reward(
        service: &mut Service,
        coin: Coin<SUI>
    ) {
        balance::join(&mut service.reward_pool, coin::into_balance(coin));
    }

    /// Mints a proof of experience for a customer
    public fun generate_proof_of_experience(
        cap: &AdminCap,
        service: &Service,
        recipient: address,
        ctx: &mut TxContext
    ) {
        // generate an NFT and transfer it to customer who can use it to write a review with higher score
        assert!(cap.service_id == object::uid_to_inner(&service.id), EInvalidPermission);
        let poe = ProofOfExperience {
            id: object::new(ctx),
            service_id: cap.service_id
        };
        transfer::transfer(poe, recipient);
    }

    /// Adds a moderator
    public fun add_moderator(
        cap: &AdminCap,
        service: &mut Service,
        recipient: address,
        ctx: &mut TxContext
    ) {
        // generate an NFT and transfer it to moderator who may use it to delete reviews
        assert!(cap.service_id == object::uid_to_inner(&service.id), EInvalidPermission);
        assert!(!table::contains<address, address>(&service.moderators, recipient), EAlreadyExists);
        table::add<address, address>(&mut service.moderators, recipient, recipient);
        let mod = Moderator {
            id: object::new(ctx),
            service_id: cap.service_id
        };
        transfer::transfer(mod, recipient);
    }

    /// Removes a moderator
    public fun remove_moderator(
        cap: &AdminCap,
        service: &mut Service,
        addr: address
    ) {
        assert!(cap.service_id == object::uid_to_inner(&service.id), EInvalidPermission);
        assert!(table::contains<address, address>(&service.moderators, addr), ENotExists);
        table::remove<address, address>(&mut service.moderators, addr);
    }

    /// Removes a review (only moderators can do this)
    public fun remove_review(
        mod: &Moderator,
        service: &mut Service,
        review_id: ID,
        ctx: &mut TxContext
    ) {
        assert!(mod.service_id == object::uid_to_inner(&service.id), EInvalidPermission);
        assert!(table::contains<address, address>(&service.moderators, tx_context::sender(ctx)), EInvalidPermission);
        assert!(table::contains<ID, ID>(&service.reviews, review_id), ENotExists);
        delist_review(service, review_id, ctx);
    }

    /// Delists a review from ranking
    fun delist_review(
        service: &mut Service,
        review_id: ID,
        ctx: &mut TxContext
    ) {
        table::remove<ID, ID>(&mut service.reviews, review_id);
        let record = df::remove<ID, ReviewRecord>(&mut service.id, review_id);
        service.overall_rate = service.overall_rate - (record.overall_rate as u64);
        let delisted = Delisted {
            id: object::new(ctx),
            review_id
        };
        if (multimap::contains<ID>(&service.top_reviews, &review_id)) {
            multimap::remove<ID>(&mut service.top_reviews, &review_id);
        };
        transfer::transfer(delisted, record.owner);
    }

    /// Removes and inserts back a review to update its ranking
    public fun reorder(
        service: &mut Service,
        rev: &Review
    ) {
        let id = review::get_id(rev);
        if (!multimap::contains<ID>(&service.top_reviews, &id)) {
            return
        };
        // remove existing review from multimap and insert back
        let total_score = review::get_total_score(rev);
        multimap::remove<ID>(&mut service.top_reviews, &id);
        multimap::insert<ID>(&mut service.top_reviews, id, total_score);
    }

    /// Deletes a unlisted review and collect storage rebates
    public fun delete_review(
        service: &Service,
        rev: Review,
        delisted: Delisted
    ) {
        assert!(delisted.review_id == review::get_id(&rev), EInvalidPermission);
        assert!(!table::contains<ID, ID>(&service.reviews, review::get_id(&rev)), ENotDelisted);
        review::delete_review(rev);
        let Delisted { id, review_id: _ } = delisted;
        object::delete(id);
    }
}
