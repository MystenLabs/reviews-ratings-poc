module contract::incentive_pool {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};

    struct POOL has key, store {
        id: UID,
        addr: address,
        owner: address,
        amount: u64
    }

    public fun pool_data(pool: &POOL): (address, address, u64) {
        (pool.addr, pool.owner, pool.amount)
    } 

    // pool creation
    public fun create_pool(pool_addr: address, incentive_amount: u64, ctx: &mut TxContext): (POOL, address) {
        let new_pool_owner = tx_context::sender(ctx);
        let new_pool = POOL {
            id: object::new(ctx),
            addr: pool_addr,
            owner: new_pool_owner,
            amount: incentive_amount
        };
        (new_pool, pool_addr)
    }
}