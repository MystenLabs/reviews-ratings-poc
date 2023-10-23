module poc::review {
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
    const ENotEnoughBalance: u64 = 2;
    const ETipExceedsRequiredTip: u64 = 3;
    const EUserAlreadyGrantedAccess: u64 = 4;
    // const EReviewerIsNotReviewWriter: u64 = 4;
    // Constants
    // Struct

    struct Revealed has key, store{
        id: UID, 
        reviewer: address,
        service: address,
        head: String,
        total_score: u8,
        decay_rate: u8,
        minumum_tip: Coin<SUI>,
    }

    // ===== Public view functions =====
    public fun head(revealed_review: &Revealed): String {
        revealed_review.head
    }

    public fun total_score(revealed_review: &Revealed): u8 {
        revealed_review.total_score
    }

    public fun decay_rate(revealed_review: &Revealed): u8 {
        revealed_review.decay_rate
    }

    public fun writer(revealed_review: &Revealed): address {
        revealed_review.reviewer
    }    

    public fun tip(revealed_review: &Revealed): u64 {
       coin::value(&revealed_review.minumum_tip)
    }    

    struct Hidden has key, store {
        id: UID, 
        reviewer: address,
        service: address,
        body: String,
        up_vote: u8,
        down_vote: u8,
        access_granted_user_list: vector<address>,
    }

    public fun body(hidden_review: &Hidden): String {
        hidden_review.body
    }

    public fun vote(hidden_review: &Hidden): (u8,u8) {
        (hidden_review.up_vote, hidden_review.down_vote)
    }

    public fun access_granted_consumers(hidden_review: &Hidden): vector<address> {
       let list = hidden_review.access_granted_user_list;
       list
    }    

    public fun is_access_granted(hidden_review: &Hidden, user: &address): bool {
        let consumer_lists = &access_granted_consumers(hidden_review);
        vector::contains(consumer_lists, user)
    }    
    
    // register auhtourized user
    public fun add_access_granted_consumer(hidden_review: &Hidden, user: address) {
        let list = access_granted_consumers(hidden_review);
        assert!(vector::contains(&list, &user), EUserAlreadyGrantedAccess);
        vector::push_back(&mut list, user);
    }

    public fun post_to_owner(
        head_contents: String,
        body_contents: String,
        service: address,
        tip_amount: Coin<SUI>,
        ctx: &mut TxContext) {
        let reviewer = tx_context::sender(ctx);
        
        let revealed_review = create_revealed_review ( 
            reviewer, 
            service, 
            head_contents, 
            tip_amount, 
            ctx
        );
        let hidden_review = create_hidden_review(
            reviewer, 
            service, 
            body_contents, 
            ctx
        );

        transfer::public_transfer(hidden_review, service);
        transfer::public_transfer(revealed_review, reviewer)
    }

    public fun create_revealed_review (
        reviewer: address,
        service: address,
        head: String,
        tip_amount: Coin<SUI>,
        ctx: &mut TxContext,
    ): Revealed {
        
        let revealed_review = Revealed {
            id: object::new(ctx),
            reviewer: reviewer,
            service: service,
            head: head,
            total_score: 0,
            decay_rate: 1,
            minumum_tip: tip_amount,
            
        };
        revealed_review
    }    

    public fun create_hidden_review (
        reviewer: address,
        service: address,
        body_contents: String,
        ctx: &mut TxContext,
    ): Hidden {
        
        let hidden_review = Hidden {
            id: object::new(ctx),
            reviewer: reviewer,
            service: service,
            body: body_contents,
            up_vote: 0,
            down_vote: 0,
            access_granted_user_list: vector::empty<address>(),
        };
        hidden_review
    }

    public fun total_score_calculation(
        intrinsic_value: u8, 
        extrinsic_value: u8, 
        verfication_multiplier: u8,
        review: &Revealed):u8 {
            let dr = decay_rate(review);
            let is = intrinsic_value;
            let es = extrinsic_value;
            let vm = verfication_multiplier;
            let total_score = (is + es) * dr * vm;
            total_score
    }

    public fun update_total_score(
        intrinsic_value: u8, 
        extrinsic_value: u8, 
        verfication_multiplier: u8, 
        revealed_review: &mut Revealed)
    {
        let total_score = total_score_calculation(
            intrinsic_value,
            extrinsic_value, 
            verfication_multiplier,
            revealed_review
        );
        revealed_review.total_score = total_score;
    }

    public fun update_decay_rate(revealed_review: &mut Revealed, decay_rate: u8){
        revealed_review.decay_rate = decay_rate;
    }

    public fun update_votes(up_vote: u8, down_vote: u8, hidden_review: &mut Hidden){
        hidden_review.up_vote = hidden_review.up_vote + up_vote;
        hidden_review.down_vote = hidden_review.up_vote + down_vote;
    }

    struct AccessTicket has key, store {
        id: UID,
        locked_review_obj_addr: address,
        reviewer: address,
        sender: address,
    }

    public fun create_access_ticket(
        review_obj_addr: address,
        reviewer: address,
        sender: address,
        ctx : &mut TxContext,
    ): AccessTicket {

        let ticket = AccessTicket {
            id: object::new(ctx),
            locked_review_obj_addr: review_obj_addr,
            reviewer: reviewer,
            sender: sender,
        };
        ticket        
    }     

    public fun full_access_req (
        revealed_review: &Revealed,
        reviewer:address,
        service_owner: address,
        balance: &mut Coin<SUI>,
        tip: u64,
        ctx : &mut TxContext,
    ) {
        let required_tip = tip(revealed_review);        
        assert!(tip < required_tip, ENotEnoughTip);
        assert!(coin::value(balance) < tip, ENotEnoughBalance);
        assert!(coin::value(balance) < required_tip, ETipExceedsRequiredTip);
        let consumer = tx_context::sender(ctx);
        let locked_review_addr = object::uid_to_address(&revealed_review.id);
        let ticket = create_access_ticket(locked_review_addr, reviewer, consumer, ctx);
        let tip_amount = coin::split(balance, tip, ctx);
        transfer::public_transfer(ticket, service_owner);
        transfer::public_transfer(tip_amount, reviewer);
    }
}