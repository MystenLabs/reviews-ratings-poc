module poc::dashboard {

    use sui::object::{Self, UID};
    use sui::dynamic_object_field as dof;

    struct Dashboard has key, store {
        id: UID
    }

    fun int() {

    }

    public fun list(
        db: &mut Dashboard, 
    ) {
        // use dynamic field objects to list reviews
        //dof::add<String, Service>
    }

}
