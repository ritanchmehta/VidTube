//error response and api response are always in the class format

class ApiResponse{
    constructor(statusCode, data, message="Succes"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode<400
    }
}

export { ApiResponse }