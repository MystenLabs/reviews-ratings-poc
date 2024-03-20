export interface Review {
    id: string;
    owner: string;
    service_id: string;
    content: string;
    len: number;
    votes: number;
    time_issued: number;
    has_poe: boolean;
    total_score: number;
}
