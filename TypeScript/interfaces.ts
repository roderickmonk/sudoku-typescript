export interface Placement {
    i: number;
    j: number;
    value: number;
}

export interface SignIn {
    username: string;
    password: string;
}

export type Puzzle = Array<number | null>;
