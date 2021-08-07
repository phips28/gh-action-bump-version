import execa, { Options as ExecaOptions } from 'execa';
import { ParsedArgs } from 'minimist';
import { LoggerFunc, Signale } from 'signale';
import { Context } from './context';
import { Exit } from './exit';
import { GitHub } from './github';
import { Store } from './store';
export interface ToolkitOptions {
    /**
     * An optional event or list of events that are supported by this Action. If
     * a different event triggers this Action, it will exit with a neutral status.
     */
    event?: string | string[];
    /**
     * An optional list of secrets that are required for this Action to function. If
     * any secrets are missing, this Action will exit with a failing status.
     */
    secrets?: string[];
    logger?: Signale;
}
export declare class Toolkit {
    /**
     * Run an asynchronous function that accepts a toolkit as its argument, and fail if
     * an error occurs.
     *
     * @param func - Async function to run
     * @param [opts] - Options to pass to the toolkit
     *
     * @example This is generally used to run a `main` async function:
     *
     * ```js
     * Toolkit.run(async tools => {
     *   // Action code here.
     * }, { event: 'push' })
     * ```
     */
    static run(func: (tools: Toolkit) => unknown, opts?: ToolkitOptions): Promise<any>;
    context: Context;
    /**
     * A key/value store for arbitrary data that can be accessed across actions in a workflow
     */
    store: Store;
    /**
     * Path to a clone of the repository
     */
    workspace: string;
    /**
     * GitHub API token
     */
    token: string;
    /**
     * An object of the parsed arguments passed to your action
     */
    arguments: ParsedArgs;
    /**
     * An Octokit SDK client authenticated for this repository. See https://octokit.github.io/rest.js for the API.
     *
     * ```js
     * const newIssue = await tools.github.issues.create({
     *   ...tools.context.repo,
     *   title: 'New issue!',
     *   body: 'Hello Universe!'
     * })
     * ```
     */
    github: GitHub;
    opts: ToolkitOptions;
    /**
     * A collection of methods used to stop an action while it's being run
     */
    exit: Exit;
    /**
     * A general-purpose logger. An instance of [Signale](https://github.com/klaussinani/signale)
     */
    log: Signale & LoggerFunc;
    constructor(opts?: ToolkitOptions);
    /**
     * Gets the contents file in your project's workspace
     *
     * ```js
     * const myFile = tools.getFile('README.md')
     * ```
     *
     * @param filename - Name of the file
     * @param encoding - Encoding (usually utf8)
     */
    getFile(filename: string, encoding?: string): string;
    /**
     * Get the package.json file in the project root
     *
     * ```js
     * const pkg = toolkit.getPackageJSON()
     * ```
     */
    getPackageJSON<T = object>(): T;
    /**
     * Get the configuration settings for this action in the project workspace.
     *
     * @param key - If this is a string like `.myfilerc` it will look for that file.
     * If it's a YAML file, it will parse that file as a JSON object. Otherwise, it will
     * return the value of the property in the `package.json` file of the project.
     *
     * @example This method can be used in three different ways:
     *
     * ```js
     * // Get the .rc file
     * const cfg = toolkit.config('.myactionrc')
     *
     * // Get the YAML file
     * const cfg = toolkit.config('myaction.yml')
     *
     * // Get the property in package.json
     * const cfg = toolkit.config('myaction')
     * ```
     */
    config<T = any>(key: string): T;
    /**
     * Run a CLI command in the workspace. This runs [execa](https://github.com/sindresorhus/execa)
     * under the hood so check there for the full options.
     *
     * @param command - Command to run
     * @param args - Argument (this can be a string or multiple arguments in an array)
     * @param cwd - Directory to run the command in
     * @param [opts] - Options to pass to the execa function
     */
    runInWorkspace(command: string, args?: string[] | string, opts?: ExecaOptions): Promise<execa.ExecaReturns>;
    /**
     * Run the handler when someone triggers the `/command` in a comment body.
     *
     * @param command - Command to listen for
     * @param handler - Handler to run when the command is used
     */
    command(command: string, handler: (args: ParsedArgs | {}, match: RegExpExecArray) => Promise<void>): Promise<void>;
    /**
     * Returns true if this event is allowed
     */
    private eventIsAllowed;
    private checkAllowedEvents;
    /**
     * Wrap a Signale logger so that its a callable class
     */
    private wrapLogger;
    /**
     * Log warnings to the console for missing environment variables
     */
    private warnForMissingEnvVars;
    /**
     * The Action should fail if there are secrets it needs but does not have
     */
    private checkRequiredSecrets;
}
