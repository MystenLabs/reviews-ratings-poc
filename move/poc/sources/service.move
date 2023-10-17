module contract::service {
    use std::string::String;
    use std::vector;        
    use sui::dynamic_object_field as dof;
    use sui::object::{Self,UID};
    use sui::table::Table;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};


    use contract::review::Unlocked;
    use contract::incentive_pool::{POOL,pool_data};

    const ENoPicture: u64 = 0;    

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
        review_list: Table<address,Unlocked>, // 
        rating: u8,
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
}