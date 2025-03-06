
const logRequestTime = (req, res, next) => {
    const currentTime = new Date().toISOString();
    console.log(`Request at: ${currentTime}`); // Sử dụng backticks để định dạng chuỗi
    next(); // Chuyển tiếp yêu cầu tới middleware tiếp theo hoặc route handler
};

export default logRequestTime;


