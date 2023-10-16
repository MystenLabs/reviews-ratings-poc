module contract::review {
    // Functional requirements
    // - Reviewer is also can be consumer
    // - Reviewer can post review to service
    // - 
    use sui::coin::{Coin, Self};
    use sui::object::{Self, UID};
    use std::string::String;
    use std::vector;
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::sui::SUI;

    // Error codes
    const ENotEnoughTip: u64 = 1;
    const EReviewerIsNotReviewWriter: u64 = 2;
    // Constants
    // Struct
    struct Obj has key, store{
        id: UID, 
        head: String,
        body: String,
        up_vote: u8,
        down_vote: u8,
        total_score: u8,
        decay_rate: u8,
        writer: address,
        minumum_tip: Coin<SUI>,
        full_view_authorized_users: vector<address>,
    }

    struct Authority_Ticket has key, store {
        id: UID,
        review_addr: address,
        writer:address
    }

     // ===== Public view functions =====
    public fun head(review: &Obj): String {
        review.head
    }
    public fun body(review: &Obj): String {
        review.body
    }
    public fun total_score(review: &Obj): u8 {
        review.total_score
    }
    public fun decay_rate(review: &Obj): u8 {
        review.decay_rate
    }
    public fun vote(review: &Obj): (u8,u8) {
        (review.up_vote, review.down_vote)
    }
    public fun writer(review: &Obj): address {
        review.writer
    }

    public fun tip(review: &Obj): u64 {
       coin::value(&review.minumum_tip)
    }    

    public fun full_view_authorized_users(review: &Obj): vector<address> {
       let list = review.full_view_authorized_users;
       list
    }

    // register auhtourized user
    public fun register_authorized_user(review: &mut Obj, user: address) {
        let list = full_view_authorized_users(review);
        vector::push_back(&mut list, user);
    }

    public fun is_authorized_user(review: &Obj, user: &address): bool {
        let user_lists = &full_view_authorized_users(review);
        vector::contains(user_lists, user)
    }

    public fun post_to_service(
        head_contents: String,
        body_contents: String,
        service: address,
        tip_amount: Coin<SUI>,
        ctx: &mut TxContext) {
        let writer = tx_context::sender(ctx);
        let (review, service_address) = create(head_contents, body_contents, service, writer, tip_amount, ctx);

        transfer::public_transfer(review, service_address)
    }

    public fun create (
        head_contents: String,
        body_contents: String,
        service: address,
        writer_address: address,
        tip_amount: Coin<SUI>,
        ctx: &mut TxContext
    ): (Obj, address) {
        let service_address = service;
        let review = Obj {
            id: object::new(ctx),
            head: head_contents,
            body: body_contents,
            up_vote: 0,
            down_vote: 0,
            total_score: 0,
            decay_rate: 1,
            writer: writer_address,
            minumum_tip: tip_amount,
            full_view_authorized_users: vector::empty<address>(),
        };

        (review, service_address)

    }

    public fun total_score_calculation(
        intrinsic_value: u8, 
        extrinsic_value: u8, 
        verfication_multiplier: u8,
        review: &Obj):u8 {
            let dr = decay_rate(review);
            let is = intrinsic_value;
            let es = extrinsic_value;
            let vm = verfication_multiplier;
            let total_score = (is + es) * dr * vm;
            total_score
    }

    public fun update_total_score(intrinsic_value: u8, extrinsic_value: u8, verfication_multiplier: u8, review: &mut Obj){
        let total_score = total_score_calculation(intrinsic_value,extrinsic_value, verfication_multiplier,review);
        review.total_score = total_score;

    }

    public fun update_votes(up_vote: u8, down_vote: u8, review: &mut Obj){
        review.up_vote = up_vote;
        review.down_vote = down_vote;
    }

    public fun update_decay_rate(review: &mut Obj, decay_rate: u8){
        review.decay_rate = decay_rate;
    }

    public fun send_full_access_req(
        review_obj_address: address,
        reviewer: address,
        tip_amount: u64,
        review_obj: &Obj,
        ctx : &mut TxContext,
        ) {
            assert!(review_obj.writer != reviewer, EReviewerIsNotReviewWriter);
            let minumum_tip = tip(review_obj);
            assert!( tip_amount < minumum_tip, ENotEnoughTip);
            let sender = tx_context::sender(ctx);
            let ticket = create_full_review_access_auth_req(review_obj_address, reviewer, ctx);
            transfer::transfer(ticket, sender)
            
        }

    public fun create_full_review_access_auth_req (
        review_obj:address,
        reviewer:address,
        ctx : &mut TxContext,
    ): Authority_Ticket {
        let ticket = Authority_Ticket {
            id: object::new(ctx),
            review_addr: review_obj,
            writer: reviewer,
        };
        ticket
    }

    


    






}