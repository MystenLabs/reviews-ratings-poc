module poc::service {

    use std::string::String;
    use std::vector;

    use sui::balance::{Self, Balance};
    use sui::clock::Clock;
    use sui::linked_table::{Self, LinkedTable};
    use sui::object::{Self, ID, UID};
    use sui::priority_queue::{Self, PriorityQueue, Entry};
    use sui::sui::SUI;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    use poc::review::{Self, Review};

// ====================== Consts =======================

    const ENoPicture: u64 = 0;
    const EInvalidPermission: u64 = 1;

// ====================== Structs ======================

    struct AdminCap has key, store {
        id: UID,
        service_id: ID
    }

    struct Service has key, store {
        id: UID,
        reward_pool: Balance<SUI>,
        reward: u64,
        reviews: PriorityQueue<ID>, // max size < 200
        recent_reviews: LinkedTable<ID, ID>, //keep last 5 reviews

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
    ) {
        let id = object::new(ctx);
        let service_id = object::uid_to_inner(&id);
        let service = Service {
            id,
            reward: 1000000000,
            reward_pool: balance::zero(),
            reviews: priority_queue::new<ID>(vector::empty()),
            recent_reviews: linked_table::new<ID, ID>(ctx),
            name
        };

        let admin_cap = AdminCap {
            id: object::new(ctx),
            service_id
        };

        // ToDo - add event emit

        transfer::share_object(service);
        transfer::public_transfer(admin_cap, tx_context::sender(ctx));
    }

    public fun list_ranked(
        service: &mut Service, 
    ) {
        // 
    }

    public fun list_recent(
        service: &mut Service, 
    ) {
        // 
    }

    public fun write_new_review(
        cap: &AdminCap, // only admin may submit 
        service: &mut Service, 
        owner: address,
        hash_of_review: vector<u8>, 
        len_of_review: u64,
        vm: u8,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(cap.service_id == object::uid_to_inner(&service.id), EInvalidPermission);
        
        let (id, ts) = review::new_review(owner, object::uid_to_inner(&service.id), hash_of_review, len_of_review, vm, clock, ctx);

        // update reviews, recent_reviews
        // service.recent_reviews
        // service.reviews
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

    public fun reorder(rev: &mut Review) {
        // DON't DO THIS HERE: review::update_total_score(rev);
        // ToDo: remove existing review from priority_queue and insert back
    }

    // how to upvote/downvote in programmable tx
    // 1. call either upvote or downvote
    // 2. call reorder
}
