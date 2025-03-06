const messages = {
  MESSAGE001: (username, authCode) => `
    Chào ${username},

Cảm ơn bạn đã dành thời gian hoàn thành Bài Test đánh giá trên Tâm Giao WEB. Chúng tôi trân trọng sự quan tâm và tin tưởng của bạn.

Kết quả của bạn:
 ${authCode}

Lưu ý: Kết quả bài test này chỉ mang tính chất tham khảo, không có giá trị thay thế chẩn đoán y khoa bởi bác sĩ/chuyên gia có chuyên môn.

Trong trường hợp có bất kỳ vấn đề băn khoăn/câu hỏi về tình trạng sức khoẻ hiện tại, bạn có thể lựa chọn các Bác sĩ Sức khoẻ tâm thần/Chuyên gia Tâm lý để được thăm khám online/offline ngay tại website của Tâm Giao.
Chúng tôi thấu hiểu những khó khăn và áp lực mà mỗi người đang phải đối mặt trong cuộc sống. Cuộc sống hiện đại với nhịp sống hối hả, nhiều lo toan có thể khiến chúng ta dễ dàng rơi vào trạng thái lo âu, căng thẳng hay stress, ảnh hưởng đến sức khỏe tinh thần và thể chất.

Điều quan trọng là chúng ta cần nhận thức được vấn đề và tìm kiếm giải pháp để cải thiện. Hãy nhớ rằng, bạn không đơn độc! Rất nhiều người đang trải qua những điều tương tự như bạn.

Trải nghiệm dịch vụ của chúng tôi tại: http://localhost:5173/login

Một lần nữa, cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi. Chúc bạn luôn mạnh khỏe và hạnh phúc.
Trân trọng,
Tâm Giao.
  `,

  MESSAGE002:(username, authCode) => `
  Chào ${username},

Cảm ơn bạn đã dành thời gian hoàn thành Bài Test đánh giá trên Tâm Giao WEB. Chúng tôi trân trọng sự quan tâm và tin tưởng của bạn.

Kết quả của bạn:
${authCode}

Lưu ý: Kết quả bài test này chỉ mang tính chất tham khảo, không có giá trị thay thế chẩn đoán y khoa bởi bác sĩ/chuyên gia có chuyên môn.

Trong trường hợp có bất kỳ vấn đề băn khoăn/câu hỏi về tình trạng sức khoẻ hiện tại, bạn có thể lựa chọn các Bác sĩ Sức khoẻ tâm thần/Chuyên gia Tâm lý để được thăm khám online/offline ngay tại website của Tâm Giao.
Chúng tôi thấu hiểu những khó khăn và áp lực mà mỗi người đang phải đối mặt trong cuộc sống. Cuộc sống hiện đại với nhịp sống hối hả, nhiều lo toan có thể khiến chúng ta dễ dàng rơi vào trạng thái lo âu, căng thẳng hay stress, ảnh hưởng đến sức khỏe tinh thần và thể chất.

Điều quan trọng là chúng ta cần nhận thức được vấn đề và tìm kiếm giải pháp để cải thiện. Hãy nhớ rằng, bạn không đơn độc! Rất nhiều người đang trải qua những điều tương tự như bạn.

Trải nghiệm dịch vụ của chúng tôi tại: http://localhost:5173/login

Một lần nữa, cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi. Chúc bạn luôn mạnh khỏe và hạnh phúc.
Trân trọng,
Tâm Giao.
`,

  MESSAGE_ERROR: "ERROR: Unknown action code.",
};

export default messages;
