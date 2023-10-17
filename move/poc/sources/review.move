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
    const EBalanceExceedsTip: u64 = 3;
    // const EReviewerIsNotReviewWriter: u64 = 4;
    // Constants
    // Struct

    struct Locked has key, store{
        id: UID, 
        reviewer: address,
        service: address,
        head: String,
        total_score: u8,
        decay_rate: u8,
        minumum_tip: Coin<SUI>,
    }

    // ===== Public view functions =====
    public fun head(locked: &Locked): String {
        locked.head
    }

    public fun total_score(locked: &Locked): u8 {
        locked.total_score
    }

    public fun decay_rate(locked: &Locked): u8 {
        locked.decay_rate
    }

    public fun writer(locked: &Locked): address {
        locked.reviewer
    }    

    public fun tip(locked: &Locked): u64 {
       coin::value(&locked.minumum_tip)
    }    

    struct Unlocked has key, store {
        id: UID, 
        reviewer: address,
        service: address,
        body: String,
        up_vote: u8,
        down_vote: u8,
        access_granted_user_list: vector<address>,
    }

    public fun body(unlocked: &Unlocked): String {
        unlocked.body
    }

    public fun vote(unlocked: &Unlocked): (u8,u8) {
        (unlocked.up_vote, unlocked.down_vote)
    }

    public fun access_granted_consumers(unlocked: &Unlocked): vector<address> {
       let list = unlocked.access_granted_user_list;
       list
    }    

    public fun is_access_granted(unlocked: &Unlocked, user: &address): bool {
        let consumer_lists = &access_granted_consumers(unlocked);
        vector::contains(consumer_lists, user)
    }    
    
    // register auhtourized user
    public fun register_consumer(unlocked: &mut Unlocked, user: address) {
        let list = access_granted_consumers(unlocked);
        vector::push_back(&mut list, user);
    }

    public fun post_to_owner(
        head_contents: String,
        body_contents: String,
        service: address,
        tip_amount: Coin<SUI>,
        ctx: &mut TxContext) {
        let reviewer = tx_context::sender(ctx);
        
        let locked_review = create_lock_review ( 
            reviewer, 
            service, 
            head_contents, 
            tip_amount, 
            ctx
        );
        let unlocked_review = create_unlock_review(
            reviewer, 
            service, 
            body_contents, 
            ctx
        );

        transfer::public_transfer(locked_review, service);
        transfer::public_transfer(unlocked_review, reviewer)
    }

    public fun create_lock_review (
        reviewer: address,
        service: address,
        head: String,
        tip_amount: Coin<SUI>,
        ctx: &mut TxContext,
    ): Locked {
        
        let locked_review = Locked {
            id: object::new(ctx),
            reviewer: reviewer,
            service: service,
            head: head,
            total_score: 0,
            decay_rate: 1,
            minumum_tip: tip_amount,
            
        };
        locked_review
    }    

    public fun create_unlock_review (
        reviewer: address,
        service: address,
        body_contents: String,
        ctx: &mut TxContext,
    ): Unlocked {
        
        let unlocked_review = Unlocked {
            id: object::new(ctx),
            reviewer: reviewer,
            service: service,
            body: body_contents,
            up_vote: 0,
            down_vote: 0,
            access_granted_user_list: vector::empty<address>(),
        };
        unlocked_review
    }

    public fun total_score_calculation(
        intrinsic_value: u8, 
        extrinsic_value: u8, 
        verfication_multiplier: u8,
        review: &Locked):u8 {
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
        locked: &mut Locked)
    {
        let total_score = total_score_calculation(
            intrinsic_value,
            extrinsic_value, 
            verfication_multiplier,
            locked
        );
        locked.total_score = total_score;
    }

    public fun update_decay_rate(locked: &mut Locked, decay_rate: u8){
        locked.decay_rate = decay_rate;
    }

    public fun update_votes(up_vote: u8, down_vote: u8, unlocked: &mut Unlocked){
        unlocked.up_vote = unlocked.up_vote + up_vote;
        unlocked.down_vote = unlocked.up_vote + down_vote;
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
        locked_review: &Locked,
        reviewer:address,
        service_owner: address,
        balance: &mut Coin<SUI>,
        tip: u64,
        ctx : &mut TxContext,
    ) {
        let required_tip = tip(locked_review);        
        assert!(tip < required_tip, ENotEnoughTip);
        assert!(coin::value(balance) < tip, ENotEnoughBalance);
        assert!(coin::value(balance) < required_tip, EBalanceExceedsTip);
        let consumer = tx_context::sender(ctx);
        let locked_review_addr = object::uid_to_address(&locked_review.id);
        let ticket = create_access_ticket(locked_review_addr, reviewer, consumer, ctx);
        let tip_amount = coin::split(balance, tip, ctx);
        transfer::public_transfer(ticket, service_owner);
        transfer::public_transfer(tip_amount, reviewer);
    }
}