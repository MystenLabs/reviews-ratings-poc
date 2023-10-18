module poc::service {
    use std::string::String;
    use std::vector;
    use sui::balance::{Self, Balance};       
    use sui::dynamic_object_field as dof;
    use sui::object::{Self, ID, UID};
    use sui::sui::SUI;
    use sui::table::Table;
    use sui::transfer;
    use sui::tx_context::{Self, sender, TxContext};

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
        // owner: address, // use AdminCap
        reward_pool: Balance<SUI>
        // reviews: vector<Review> // use priority_queue?, max size should be < 1000
        // recent_reviews: vector<Review> // keep last 5 reviews

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
        // timestamp: String,
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
        poe: ProofOfExperience, 
        service: &SERVICE, 
        hash_of_review: vector<u8>, 
        ctx: &mut TxContext
    ) {
        assert!(poe.service_id == object::uid_to_inner(&service.id), EInvalidPermission);

        // burn poe
        let ProofOfExperience {id, service_id: _} = poe;
        object::delete(id);

        // check if timestamp expired
        // if (timestamp of poe expired?) {
        //     return; // still burn poe
        // }

        // ToDo - create review object and transfer to sender

    }

}
