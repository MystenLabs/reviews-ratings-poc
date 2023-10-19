module poc::incentive_pool {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::sui::SUI;
    use sui::coin::{Coin, Self};

    struct POOL has key, store {
        id: UID,
        
        owner: address,
        amount: Coin<SUI>
    }

    public fun pool_data(pool: &POOL): (address, address, u64) {
        let amount = coin::value(&pool.amount);
        let pool_addr = object::uid_into_address(&pool.id);
        (pool.addr, pool.owner, amount)
    } 

    // pool creation
    public fun create_pool(pool_amount: Coin<SUI>, ctx: &mut TxContext): (POOL, address) {
        let pool_owner = tx_context::sender(ctx);
        let new_pool = POOL {
            id: object::new(ctx),
            
            owner: pool_owner,
            amount: pool_amount
        };
        (new_pool, pool_addr)
    }

    // TODO : implement pool minting
    // public fun mint_pool(ctx: &mut TxContext) {

    // }

    
}