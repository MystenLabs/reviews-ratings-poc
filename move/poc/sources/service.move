module poc::service {

    use std::string::String;
    use std::vector;
    use sui::balance::{Self, Balance};       
    use sui::dynamic_object_field as dof;
    use sui::object::{Self, ID, UID};
    use sui::sui::SUI;
    use sui::transfer;
    use sui::tx_context::{Self, sender, TxContext};
    use sui::clock::Clock;
    use sui::priority_queue::{Self, PriorityQueue, Entry};
    use sui::linked_table::{Self, LinkedTable};

    use poc::review::{mint_review, get_total_score};

// ====================== Consts =======================

    const ENoPicture: u64 = 0;
    const EInvalidPermission: u64 = 1;

// ====================== Structs ======================

    struct AdminCap has key, store {
        id: UID,
        service_id: ID
    }

    struct SERVICE has key, store {
        id: UID,
        reward_pool: Balance<SUI>,
        reviews: PriorityQueue<ID>, // max size < 200
        recent_reviews: LinkedTable<ID, ID>, //keep last 5 reviews

        // cuisine_type: String,
        // location: String,
        // google_map_url: String,
        // operating_hours: String,
        // url: String,
        // pictures_urls: vector<u8>,
        // reviewer_lists: vector<address>,
        // review_list: Table<address,Unlocked>, // 
        // rating: u8,
    }

    struct ProofOfExperience has key, store {
        id: UID,
        service_id: ID,
    }

// ======================== Functions ===================

    fun init(ctx: &mut TxContext){
    }

    public fun create_service(
        // ToDo - pass required fields
        ctx: &mut TxContext,
    ) {
        let id = object::new(ctx);
        let service_id = object::uid_to_inner(&id);
        let service = SERVICE {
            id,
            reward_pool: balance::zero(),
            reviews: priority_queue::new<ID>(vector::empty()),
            recent_reviews: linked_table::new<ID, ID>(ctx)
        };

        let admin_cap = AdminCap {
            id: object::new(ctx),
            service_id
        };

        // ToDo - add event emit

        transfer::share_object(service);
        transfer::public_transfer(admin_cap, sender(ctx));
    }

    public fun generate_proof_of_experience(
        cap: &AdminCap, 
        service: &SERVICE, 
        recipient: address, 
        ctx: &mut TxContext
    ) {
        assert!(cap.service_id == object::uid_to_inner(&service.id), EInvalidPermission);
        let id = object::new(ctx);
        let poe = ProofOfExperience {
            id,
            service_id: cap.service_id
            // timestamp: ""
        };
        // ToDo - add event emit
        transfer::transfer(poe, recipient);
    }

    public fun write_new_review(
        cap: &AdminCap, // only admin may submit 
        service: &mut SERVICE, 
        hash_of_review: vector<u8>, 
        owner: address,
        is: u8, es: u8, vm: u8,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(cap.service_id == object::uid_to_inner(&service.id), EInvalidPermission);
        // ToDo - create review object and transfer to sender
        // How to compute is?
        mint_review(owner, object::uid_to_inner(&service.id), hash_of_review, is, es, vm, clock, ctx);

        // update reviews, recent_reviews
        // let ts = ...
        // service.recent_reviews
        // service.reviews
    }

}
