module poc::review {

    friend poc::service;

    use std::string::String;

    use sui::clock::{Self, Clock};
    use sui::coin::{Coin, Self};
    use sui::math;
    use sui::object::{Self, ID, UID};
    use sui::sui::SUI;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    // Error codes
    const ENotEnoughBalance: u64 = 1;
    const EInvalidPermission: u64 = 2;
    const EAlreadyLocked: u64 = 3;
    const ENotEnoughPayment: u64 = 4;
    const EMaxDownvoteReached: u64 = 5;

    struct Review has key, store {
        id: UID,
        owner: address,
        service_id: ID,

        hash: String,
        len: u64, // is
        votes: u64, // es
        time_issued: u64, // dr
        has_poe: bool, // vm: proof of experience
        ts: u64, // total score
        is_locked: bool,
        fee_to_unlock: u64
    }

    struct ReviewAccessGrant has key {
        id: UID,
        owner: address,
        review_id: ID
    }

    public fun new_review(
        owner: address, 
        service_id: ID, 
        hash: String,
        len: u64, 
        has_poe: bool, 
        clock: &Clock, 
        ctx: &mut TxContext
    ): (ID, u64) {
        let new_review = Review {
            id: object::new(ctx),
            owner: owner,
            service_id,
            hash,
            len,
            votes: 10, // start with 10, can go down to 0
            time_issued: clock::timestamp_ms(clock),
            has_poe,
            ts: 0,
            is_locked: false,
            fee_to_unlock: 1000000000
        };

        new_review.ts = calculate_total_score(&new_review);

        let id = object::uid_to_inner(&new_review.id);
        let ts = new_review.ts;
        transfer::share_object(new_review);
        (id, ts)
    }

    fun calculate_total_score(rev: &Review): u64 {
        // compute total score 
        // Result is in 2 decimals points in precision; 100 is actually 1
        // TS = (IS + ES) * DR * VM

        // IS = len / 100; max = 1.5, min = 0
        let is: u64 = rev.len;
        is = math::min(is, 150);
        
        // ES = # of upvotes; 1 + (0.1 * per upvotes)
        let es: u64 = 10 * rev.votes;
        
        // DR = days remaining until expired; expires in 180 days
        // ToDo

        // VM = either 1.0 or 2.0 (if user has proof of experience)
        let vm: u64 = 1;
        if (rev.has_poe == true) {
            vm = 2;
        };

        (is + es) * vm
    }

    public fun update_total_score(rev: &mut Review) {
        rev.ts = calculate_total_score(rev);
    }

    public fun lock(rev: &mut Review, ctx: &mut TxContext) {
        // only the owner of a Review may lock
        assert!(rev.owner == tx_context::sender(ctx), EInvalidPermission);
        assert!(rev.is_locked == false, EAlreadyLocked);
        rev.is_locked = true;
    }

    public fun grant_access_to(
        rev: &Review, 
        payment: &mut Coin<SUI>, 
        recepient: address, 
        ctx: &mut TxContext
    ) {
        assert!(coin::value(payment) < rev.fee_to_unlock, ENotEnoughPayment);
        // generate an NFT that consumers can use to have access to obfuscated review
        let new_access = ReviewAccessGrant {
            id: object::new(ctx),
            owner: recepient,
            review_id: object::uid_to_inner(&rev.id)
        };

        // pay rev.owner
        let fee = coin::split(payment, rev.fee_to_unlock, ctx);
        transfer::public_transfer(fee, rev.owner);

        transfer::transfer(new_access, recepient);
    }

    public fun upvote(rev: &mut Review) {
        rev.votes = rev.votes + 1;
        update_total_score(rev);
    }

    public fun downvote(rev: &mut Review) {
        assert!(rev.votes > 0, EMaxDownvoteReached);
        rev.votes = rev.votes - 1;
        update_total_score(rev);
    }

    public fun get_id(rev: &Review): ID {
        object::uid_to_inner(&rev.id)
    }

    public fun get_total_score(rev: &Review): u64 {
        rev.ts
    }

}
