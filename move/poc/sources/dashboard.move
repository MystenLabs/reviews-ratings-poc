module poc::dashboard {

    use std::string::String;

    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::tx_context::TxContext;
    use sui::vec_set::{Self, VecSet};

    struct Dashboard has key, store {
        id: UID,
        set: VecSet<ID>,
        service_type: String
    }

    public entry fun create_dashboard(
        service_type: String,
        ctx: &mut TxContext,
    ) {
        let db = Dashboard {
            id: object::new(ctx),
            set: vec_set::empty(),
            service_type
        };
        transfer::share_object(db);
    }

    public fun list(db: &Dashboard): &vector<ID> {
        vec_set::keys<ID>(&db.set)
    }

    public fun register_service(db: &mut Dashboard, service_id: ID) {
        vec_set::insert<ID>(&mut db.set, service_id);
    }

}
