module poc::review {

    friend poc::service;

    use sui::coin::{Coin, Self};
    use sui::object::{Self, ID, UID};
    use std::string::String;
    use std::vector;
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};

    // Error codes
    const ENotEnoughTip: u64 = 1;
    const ENotEnoughBalance: u64 = 2;
    const EBalanceExceedsTip: u64 = 3;

    struct Review has key, store {
        id: UID,
        owner: address,
        service_id: ID,

        hash: vector<u8>, 
        is: u8,
        es: u8,
        time_issued: u64, // dr: u8,
        vm: u8,
    }

    public(friend) fun mint_review(owner: address, service_id: ID, hash: vector<u8>, is: u8, es: u8, vm: u8, clock: &Clock, ctx: &mut TxContext) {
        let new_review = Review {
            id: object::new(ctx),
            owner: owner,
            service_id,
            hash,
            is,
            es,
            time_issued: clock::timestamp_ms(clock),
            vm,
        };

        transfer::transfer(new_review, owner);
    }

}
