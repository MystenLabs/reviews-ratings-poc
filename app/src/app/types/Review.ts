export interface Review {
    id: string;
    owner: string;
    service_id: string;
    hash: string;
    len: number;
    votes: number;
    time_issued: number;
    has_poe: boolean;
    ts: number;
    is_locked: boolean;
    fee_to_unlock: number;
}
