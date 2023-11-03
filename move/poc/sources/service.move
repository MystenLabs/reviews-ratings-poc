module poc::service {

    use std::string::String;
    use std::vector;

    use sui::balance::{Self, Balance};
    use sui::clock::Clock;
    use sui::object::{Self, ID, UID};
    use sui::sui::SUI;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    use poc::multimap::{Self, MultiMap};
    use poc::review::{Self, Review};

// ====================== Consts =======================

    const ENoPicture: u64 = 0;
    const EInvalidPermission: u64 = 1;
    const EMaxReviews: u64 = 2;

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

        name: String

        // location: String,
        // google_map_url: String,
        // operating_hours: String,
        // url: String,
        // rating: u8,
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
            reward: 1000000000,
            reward_pool: balance::zero(),
            reviews: multimap::empty<ID>(),
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
        cap: &AdminCap,
        service: &mut Service, 
        owner: address,
        hash_of_review: String,
        len_of_review: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Only admin(service owner) can submit a review
        // after verifying that reviewer has proof of experience (QR code)
        assert!(cap.service_id == object::uid_to_inner(&service.id), EInvalidPermission);
        assert!(multimap::size<ID>(&service.reviews) < 500, EMaxReviews);
        let (id, ts) = review::new_review(owner, object::uid_to_inner(&service.id), hash_of_review, len_of_review, true, clock, ctx);
        multimap::insert<ID>(&mut service.reviews, id, ts);
    }

    public fun write_new_review_without_poe(
        service: &mut Service, 
        owner: address,
        hash_of_review: String,
        len_of_review: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // DANGER: anyone can submit a review, without going to through any screening
        // This fun could be removed in future the versions
        assert!(multimap::size<ID>(&service.reviews) < 500, EMaxReviews);
        let (id, ts) = review::new_review(owner, object::uid_to_inner(&service.id), hash_of_review, len_of_review, false, clock, ctx);
        multimap::insert<ID>(&mut service.reviews, id, ts);
    }

    public fun distribute_reward(
        cap: &AdminCap,
        service: &mut Service, 
    ) {
        assert!(cap.service_id == object::uid_to_inner(&service.id), EInvalidPermission);

        // distribute a fixed amount to top 10 reviewers
    }

    // public fun generate_proof_of_experience() {
    //     // generate an NFT and transfer it to customer who can use it to write a review with vm
    // }

    public fun recompute_ts_for_all(
        cap: &AdminCap,
        service: &mut Service
    ) {
        assert!(cap.service_id == object::uid_to_inner(&service.id), EInvalidPermission);
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