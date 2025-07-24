class APIError extends Error {
    constructor(
        StatusCode,
        message="Internal Server Error",
        error=[],
        stack=""
    ){
        super(message);
        this.StatusCode = StatusCode;
        this.error = error;
        this.stack = stack;
        this.data=null;
        this.message = message;
        this.success = false;
    }
}
export { APIError };