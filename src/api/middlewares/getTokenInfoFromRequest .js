import jwt from 'jsonwebtoken';

const getTokenInfoFromRequest = (req) => {
    // Kiểm tra xem header Authorization có tồn tại không
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        // Lấy token từ header
        const token = authHeader.split(' ')[1]; // Tách ra để lấy phần token
        
        // Giải mã token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Sử dụng secret để giải mã
            return decoded; // Trả về nội dung đã giải mã
        } catch (err) {
            console.error('Token không hợp lệ:', err);
            return null; // Nếu giải mã thất bại, trả về null
        }
    }

    return null; // Nếu không có token, trả về null
};


export default getTokenInfoFromRequest;
