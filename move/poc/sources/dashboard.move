module poc::dashboard {

    use sui::object::{Self, ID, UID};
    use sui::vec_set::{Self, VecSet};
    use sui::tx_context::{Self, sender, TxContext};
    use sui::transfer;

    struct Dashboard has key, store {
        id: UID,
        set: VecSet<ID>
    }

    fun init(ctx: &mut TxContext){
    }

    public fun create_dashboard(
        ctx: &mut TxContext,
    ) {
        let db = Dashboard {
            id: object::new(ctx),
            set: vec_set::empty()
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
