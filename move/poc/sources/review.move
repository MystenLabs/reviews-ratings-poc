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
    const EAlreadyLocked: u64 = 4;
    const ENotEnoughPayment: u64 = 5;

    struct Review has key, store {
        id: UID,
        owner: address,
        service_id: ID,

        hash: vector<u8>, 
        len: u64, // is: u8
        votes: u64, // es
        time_issued: u64, // dr: u8,
        vm: u8, // based on proof of experience, either 1 or 1.2
        is_locked: bool,
        fee_to_unlock: u64
    }

    struct ReviewAccessGrant has key {
        id: UID,
        owner: address,
        review_id: ID
    }

    public(friend) fun mint_review(owner: address, service_id: ID, hash: vector<u8>, len: u64, vm: u8, clock: &Clock, ctx: &mut TxContext) {
        let new_review = Review {
            id: object::new(ctx),
            owner: owner,
            service_id,
            hash,
            len,
            votes: 0,
            time_issued: clock::timestamp_ms(clock),
            vm,
            is_locked: false,
            fee_to_unlock: 1000000000
        };

        transfer::transfer(new_review, owner);
    }

    public(friend) fun get_total_score(rev: &Review, ctx: &mut TxContext): u8 {
        // compute total score
        // TS = (IS + ES) * DR * VM
        // IS = len / 100; max = 1.5, min = 0
        // ES = # of upvotes; 1 + (0.1 * per upvotes), min = 0
        // DR = days remaining until expired; expires in 180 days
        // VR = either 1.0 or 1.2 (if user has proof of experience)
        100
    }

    public fun lock(rev: &mut Review) {
        // only the owner of a Review may lock
        assert!(rev.is_locked == true, EAlreadyLocked);
        rev.is_locked = true;
    }

    public(friend) fun grant_access(
        owner: address, 
        rev: &Review, 
        payment: &mut Coin<SUI>, 
        ctx: &mut TxContext
    ) {
        assert!(coin::value(payment) < rev.fee_to_unlock, ENotEnoughPayment);
        // generate an NFT that consumers can use to have access to obfuscated review
        let new_access = ReviewAccessGrant {
            id: object::new(ctx),
            owner: owner,
            review_id: object::uid_to_inner(&rev.id)
        };

        // pay rev.owner
        let fee = coin::split(payment, rev.fee_to_unlock, ctx);
        transfer::public_transfer(fee, rev.owner);

        transfer::transfer(new_access, owner);
    }

}
