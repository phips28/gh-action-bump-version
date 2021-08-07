import { Signale } from 'signale';
/**
 * The code to exit an action with a "success" state
 */
export declare const SuccessCode = 0;
/**
 * The code to exit an action with a "failure" state
 */
export declare const FailureCode = 1;
/**
 * The code to exit an action with a "neutral" state
 */
export declare const NeutralCode = 78;
export declare class Exit {
    logger: Signale;
    constructor(logger: Signale);
    /**
     * Stop the action with a "success" status
     */
    success(message?: string): void;
    /**
     * Stop the action with a "neutral" status
     */
    neutral(message?: string): void;
    /**
     * Stop the action with a "failed" status
     */
    failure(message?: string): void;
}
