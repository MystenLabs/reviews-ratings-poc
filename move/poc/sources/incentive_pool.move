module poc::incentive_pool {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::sui::SUI;
    use sui::coin::{Coin, Self};

    struct POOL has key, store {
        id: UID,
        addr: address,
        owner: address,
        amount: Coin<SUI>
    }

    public fun pool_data(pool: &POOL): (address, address, u64) {
        let amount = coin::value(&pool.amount);
        (pool.addr, pool.owner, amount)
    } 

    // pool creation
    public fun create_pool(pool_addr: address, incentive_amount: Coin<SUI>, ctx: &mut TxContext): (POOL, address) {
        let new_pool_ aowner = tx_context::sender(ctx);
        let new_pool = POOL {
            id: object::new(ctx),
            addr: pool_addr,
            owner: new_pool_owner,
            amount: incentive_amount
        };
        (new_pool, pool_addr)
    }
}