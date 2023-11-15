module poc::service {

    use std::string::String;

    use sui::balance::{Self, Balance};
    use sui::clock::Clock;
    use sui::coin::{Self, Coin};
    use sui::dynamic_field;
    use sui::object::{Self, ID, UID};
    use sui::sui::SUI;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    use poc::multimap::{Self, MultiMap};
    use poc::review::{Self, Review};

// ====================== Consts =======================

    const EInvalidPermission: u64 = 1;
    const EMaxReviews: u64 = 2;
    const ENotEnoughBalance: u64 = 3;

// ====================== Structs ======================

    struct AdminCap has key, store {
        id: UID,
        service_id: ID
    }

    struct Service has key, store {
        id: UID,
        reward_pool: Balance<SUI>,
        reward: u64,
        reviews: MultiMap<ID>, // max size < 500

        overall_rate: u64, // overall rating

        name: String
    }

    struct ProofOfExperience has key {
        id: UID,
        service_id: ID,
    }

    // ======================== Functions ===================

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
            reviews: multimap::empty<ID>(),
            overall_rate: 0,
            name
        };

        let admin_cap = AdminCap {
            id: object::new(ctx),
            service_id
        };

        // ToDo - add event emit

        let id = object::uid_to_inner(&service.id);
        transfer::share_object(service);
        transfer::public_transfer(admin_cap, tx_context::sender(ctx));
        id
    }

    public fun write_new_review(
        service: &mut Service,
        owner: address,
        hash_of_review: String,
        len_of_review: u64,
        overall_rate: u8,
        clock: &Clock,
        poe: ProofOfExperience,
        ctx: &mut TxContext
    ) {
        assert!(poe.service_id == object::uid_to_inner(&service.id), EInvalidPermission);
        assert!(multimap::size<ID>(&service.reviews) < 500, EMaxReviews);
        let ProofOfExperience {id, service_id: _} = poe;
        object::delete(id);
        let (id, ts) = review::new_review(owner, object::uid_to_inner(&service.id), hash_of_review, len_of_review, true, overall_rate, clock, ctx);
        multimap::insert<ID>(&mut service.reviews, id, ts);
        let overall_rate = (overall_rate as u64);
        service.overall_rate = service.overall_rate + overall_rate;
        dynamic_field::add<ID, address>(&mut service.id, id, owner);
    }

    public fun write_new_review_without_poe(
        service: &mut Service, 
        owner: address,
        hash_of_review: String,
        len_of_review: u64,
        overall_rate: u8,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(multimap::size<ID>(&service.reviews) < 500, EMaxReviews);
        let (id, ts) = review::new_review(owner, object::uid_to_inner(&service.id), hash_of_review, len_of_review, false, overall_rate, clock, ctx);
        multimap::insert<ID>(&mut service.reviews, id, ts);
        let overall_rate = (overall_rate as u64);
        service.overall_rate = service.overall_rate + overall_rate;
        dynamic_field::add<ID, address>(&mut service.id, id, owner);
    }

    public fun distribute_reward(
        cap: &AdminCap,
        service: &mut Service,
        ctx: &mut TxContext
    ) {
        assert!(cap.service_id == object::uid_to_inner(&service.id), EInvalidPermission);
        // distribute a fixed amount to top 10 reviewers
        let len = multimap::size<ID>(&service.reviews);
        if (len > 10) {
            len = 10;
        };
        // check balance
        assert!(balance::value(&service.reward_pool) >= (service.reward * len), ENotEnoughBalance);
        let i = 0;
        while (i < len) {
            let sub_balance = balance::split(&mut service.reward_pool, service.reward);
            let reward = coin::from_balance(sub_balance, ctx);
            let (review_id, _) = multimap::get_entry_by_idx<ID>(&service.reviews, i);
            let review_owner_address = dynamic_field::borrow<ID, address>(&service.id, *review_id);
            transfer::public_transfer(reward, *review_owner_address);
            i = i + 1;
        };
    }

    public fun top_up_reward(
        service: &mut Service,
        coin: Coin<SUI>
    ) {
        balance::join(&mut service.reward_pool, coin::into_balance(coin));
    }

    public fun generate_proof_of_experience(
        cap: &AdminCap,
        service: &Service,
        recipient: address,
        ctx: &mut TxContext
    ) {
        // generate an NFT and transfer it to customer who can use it to write a review with vm
        assert!(cap.service_id == object::uid_to_inner(&service.id), EInvalidPermission);
        let poe = ProofOfExperience {
            id: object::new(ctx),
            service_id: cap.service_id
        };
        // ToDo - add event emit
        transfer::transfer(poe, recipient);
    }

    public fun reorder(
        service: &mut Service,
        rev: &Review
    ) {
        // remove existing review from multimap and insert back
        let id = review::get_id(rev);
        let ts = review::get_total_score(rev);
        multimap::remove<ID>(&mut service.reviews, &id);
        multimap::insert<ID>(&mut service.reviews, id, ts);
    }

}