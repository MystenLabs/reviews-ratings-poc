module poc::review {
    use std::string::String;

    use sui::clock::{Self, Clock};
    use sui::math;
    use sui::object::{Self, ID, UID};
    use sui::tx_context::TxContext;

    friend poc::service;

    const EMaxDownvoteReached: u64 = 1;
    const EInvalidContentLen: u64 = 2;

    const MIN_REVIEW_CONTENT_LEN: u64 = 5;
    const MAX_REVIEW_CONTENT_LEN: u64 = 1000;

    /// Represents a review of a service
    struct Review has key, store {
        id: UID,
        owner: address,
        service_id: ID,
        content: String,
        // intrinsic score
        len: u64,
        // extrinsic score
        votes: u64,
        time_issued: u64,
        // proof of experience
        has_poe: bool,
        // total score
        total_score: u64,
        // overall rating value; max=5
        overall_rate: u8,
    }

    /// Creates a new review
    public(friend) fun new_review(
        owner: address,
        service_id: ID,
        content: String,
        has_poe: bool,
        overall_rate: u8,
        clock: &Clock,
        ctx: &mut TxContext
    ): Review {
        let len = std::string::length(&content);
        assert!(len > MIN_REVIEW_CONTENT_LEN && len <= MAX_REVIEW_CONTENT_LEN, EInvalidContentLen);
        let new_review = Review {
            id: object::new(ctx),
            owner,
            service_id,
            content,
            len,
            votes: 10, // start with 10, can go down to 0
            time_issued: clock::timestamp_ms(clock),
            has_poe,
            total_score: 0,
            overall_rate,
        };
        new_review.total_score = calculate_total_score(&new_review);
        new_review
    }

    /// Deletes a review
    public(friend) fun delete_review(rev: Review) {
        let Review {
            id, owner: _, service_id: _, content: _, len: _, votes: _, time_issued: _,
            has_poe: _, total_score: _, overall_rate: _
        } = rev;
        object::delete(id);
    }

    /// Calculates the total score of a review
    fun calculate_total_score(rev: &Review): u64 {
        // compute total score 
        // Result is in 2 decimals points in precision; 100 is actually 1
        // TOTALSCORE = (IS + ES) * VM

        // intrinsic_score = len / 100; max = 1.5
        let intrinsic_score: u64 = rev.len;
        intrinsic_score = math::min(intrinsic_score, 150);

        // extrinsic_score = # of upvotes; 1 + (0.1 * per upvotes)
        let extrinsic_score: u64 = 10 * rev.votes;

        // VM = either 1.0 or 2.0 (if user has proof of experience)
        let vm: u64 = 1;
        if (rev.has_poe == true) {
            vm = 2;
        };

        (intrinsic_score + extrinsic_score) * vm
    }

    /// Updates the total score of a review
    public fun update_total_score(rev: &mut Review) {
        rev.total_score = calculate_total_score(rev);
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
        rev.total_score
    }

    public fun get_time_issued(rev: &Review): u64 {
        rev.time_issued
    }
}
