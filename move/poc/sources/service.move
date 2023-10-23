module poc::service {
    use std::string::String;
    use std::vector;        
    use sui::dynamic_object_field as dof;
    use sui::object::{Self,UID};
    use sui::table::{Table, Self};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    use poc::incentive_pool::{POOL,pool_data};

    const ENoPicture: u64 = 0;    
    const EReviewerAlreadyAdded: u64 = 1;

    // Service List will show the regiered services to users this will be shared object
    // because of the this Lists has to be amended by the service owner
    struct Registery has key {
        id: UID,
    }

    struct ServiceMetaData has key, store {
        id: UID,
        owner: address,
        service_obj_address: address
    }    

    struct SERVICE has key, store {
        id: UID,
        owner: address,
        pool: POOL,
        cuisine_type: String,
        location: String,
        google_map_url: String,
        operating_hours: String,
        url: String,
        pictures_urls: vector<u8>,
        reviewer_lists: vector<address>,
        review_list: Table<address,String>, // 
        rating: u8,
    }

    struct ProofOfExperience has key, store {
        id:UID,
        timestamp: String,
        service_address: address
    }

    fun init(ctx: &mut TxContext){
        let service_list = Registery{
            id: object::new(ctx)
        };
        transfer::share_object(service_list)
    }

    public fun register_service(
        service: &SERVICE,
        registry: &mut Registery,
        ctx: &mut TxContext,
    ) {
        let service_owner = tx_context::sender(ctx);
        let service_address = object::uid_to_address(&service.id);
        let service_meta_data = ServiceMetaData{
            id: object::new(ctx),
            owner: service_owner,
            service_obj_address: service_address
        };
        let registry_id = &mut registry.id;

        dof::add(registry_id, service_address, service_meta_data)
    }        

    // public view functions
    public fun owner(service: &SERVICE): address {
        service.owner
    }

    public fun pool(service: &SERVICE): (address, address, u64) {
       pool_data(&service.pool)
    }
    
    public fun cuisine_type(service: &SERVICE): String {
        service.cuisine_type
    }

    public fun location(service: &SERVICE): String {
        service.location
    }

    public fun google_map_url(service: &SERVICE): String {
        service.google_map_url
    }

    public fun operating_hours(service: &SERVICE): String {
        service.operating_hours
    }

    public fun url(service: &SERVICE): String {
        service.url
    }

    public fun pictures_urls(service: &SERVICE): vector<u8> {
        assert!(vector::length(&service.pictures_urls) == 0, ENoPicture);
        service.pictures_urls
    }    

    public fun verified_user_lists(service: &SERVICE): vector<address> {
        service.reviewer_lists
    }

    public fun rating(service: &SERVICE): u8 {
        service.rating
    }


    public fun create_service(
        cuisine_type: String,
        location: String,
        google_map_url: String,
        operating_hours: String,
        url: String,
        pool : POOL,
        ctx: &mut TxContext,
    ):SERVICE {
        let owner = tx_context::sender(ctx);
        
        let service = SERVICE{
            id: object::new(ctx),
            owner: owner,
            pool: pool,
            cuisine_type: cuisine_type,
            location: location,
            google_map_url: google_map_url,
            operating_hours: operating_hours,
            url: url,
            pictures_urls: vector::empty(),
            reviewer_lists: vector::empty(),
            review_list: table::new<address, String>(ctx),
            rating: 0,
        };
        service
    }    
    // TODO: implement below functions
    public fun mint_service(
        cuisine_type: String,
        location: String,
        google_map_url: String,
        operating_hours: String,
        url: String,
        pool : POOL,
        ctx: &mut TxContext
        ) {
        let sender = tx_context::sender(ctx);
        let service = create_service(
            cuisine_type,
            location,
            google_map_url,
            operating_hours,
            url,
            pool,
            ctx
        );
        transfer::public_transfer(service, sender);
    }

    public fun mint_poe_mark(time_stamp: String, ctx: &mut TxContext):ProofOfExperience {
        let poe_mark = ProofOfExperience{
            id: object::new(ctx),
            timestamp: time_stamp,
            service_address: tx_context::sender(ctx)
        };
        poe_mark
    }

    public fun send_poe_mark(time_stamp: String, reviwer:address ,ctx: &mut TxContext) {
        let poe_mark = mint_poe_mark (time_stamp, ctx);
        transfer::public_transfer(poe_mark, reviwer)
    }

    // public fun add_review(review_hash_string: String, service: &mut SERVICE, ctx: &mut TxContext) {
         
    // }

    public fun add_reviewer(reviewer: address, service: &mut SERVICE) {
        let reviewer_lists_ref = &service.reviewer_lists;
        let reviewer_list_mut = &mut service.reviewer_lists;
        assert!(vector::contains<address>(reviewer_lists_ref, &reviewer), EReviewerAlreadyAdded);
        vector::push_back<address>(reviewer_list_mut, reviewer)
    }

}