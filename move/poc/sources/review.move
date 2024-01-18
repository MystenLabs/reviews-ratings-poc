module poc::review {

    friend poc::service;

    use std::string::String;

    use sui::clock::{Self, Clock};
    use sui::math;
    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::tx_context::TxContext;

    const EMaxDownvoteReached: u64 = 1;

    /// Represents a review of a service
    struct Review has key, store {
        id: UID,
        owner: address,
        service_id: ID,
        content: String,
        len: u64, // is
        votes: u64, // es
        time_issued: u64, // dr
        has_poe: bool, // vm: proof of experience
        ts: u64, // total score
        overall_rate: u8, // overall rating value; max=5
    }

    /// Creates a new review
    public fun new_review(
        owner: address,
        service_id: ID,
        content: String,
        has_poe: bool,
        overall_rate: u8,
        clock: &Clock,
        ctx: &mut TxContext
    ): (ID, u64) {
        let new_review = Review {
            id: object::new(ctx),
            owner,
            service_id,
            content,
            len: 0,
            votes: 10, // start with 10, can go down to 0
            time_issued: clock::timestamp_ms(clock),
            has_poe,
            ts: 0,
            overall_rate,
        };

        new_review.len = std::string::length(&content);
        new_review.ts = calculate_total_score(&new_review);

        let id = object::uid_to_inner(&new_review.id);
        let ts = new_review.ts;
        transfer::share_object(new_review);
        (id, ts)
    }

    /// Calculates the total score of a review
    fun calculate_total_score(rev: &Review): u64 {
        // compute total score 
        // Result is in 2 decimals points in precision; 100 is actually 1
        // TS = (IS + ES) * VM

        // IS = len / 100; max = 1.5, min = 0
        let is: u64 = rev.len;
        is = math::min(is, 150);

        // ES = # of upvotes; 1 + (0.1 * per upvotes)
        let es: u64 = 10 * rev.votes;

        // VM = either 1.0 or 2.0 (if user has proof of experience)
        let vm: u64 = 1;
        if (rev.has_poe == true) {
            vm = 2;
        };

        (is + es) * vm
    }

    /// Updates the total score of a review
    public fun update_total_score(rev: &mut Review) {
        rev.ts = calculate_total_score(rev);
    }

    /// Upvotes a review
    public fun upvote(rev: &mut Review) {
        rev.votes = rev.votes + 1;
        update_total_score(rev);
    }

    /// Downvotes a review
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