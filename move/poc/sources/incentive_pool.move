module poc::incentive_pool {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::sui::SUI;
    use sui::transfer;
    use sui::coin::{Coin, Self};

    struct POOL has key, store {
        id: UID,
        owner: address,
        amount: Coin<SUI>
    }

    public fun pool_data(pool: &POOL): (address, address, u64) {
        let amount = coin::value(&pool.amount);
        let pool_address = object::uid_to_address(&pool.id);
        (pool_address, pool.owner, amount)
    } 

    // pool creation
    public fun create_pool(incentive_amount: Coin<SUI>, ctx: &mut TxContext): POOL {
        let new_pool_owner = tx_context::sender(ctx);
        let new_pool = POOL {
            id: object::new(ctx),
            owner: new_pool_owner,
            amount: incentive_amount
        };
        new_pool
    }

    public fun minting_pool( pool_amount: Coin<SUI>, ctx: &mut TxContext) {
        let pool = create_pool(pool_amount, ctx);
        let owner = tx_context::sender(ctx);
        transfer::public_transfer(pool, owner);

        // Send pool amount to pool will be executed in ts. 
        // or we can implement function for sending pool amount to pool
    }

    
   
}