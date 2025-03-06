import Tests from "../models/test.model.js";
import TestHistory from "../models/testHistory.model.js";
import Question from "../models/question.model.js";
import {MailService} from "../services/index.js";
import actions from '../actions/requestController.action.js';

const getUserAnswerForQuestion = async (req, res, next) => {
    try {
        const { userId, testId } = req.params;

        const testHistory = await TestHistory.findOne({ userId, testId })
            .populate("userId", "fullName -_id")
            .populate("testId", "title -_id")
            .exec();

        if (!testHistory) {
            return res.status(404).json({ message: "Không tìm thấy bài kiểm tra." });
        }

        // 2. Lấy danh sách questionId từ TestHistory
        const questionIds = testHistory.questions.map((q) => q.questionId);

        // 3. Truy vấn chi tiết câu hỏi từ bảng Question
        const questions = await Question.find({ _id: { $in: questionIds } });

        const response = testHistory.questions.map((qh) => {
            const questionDetail = questions.find((q) => q._id.equals(qh.questionId)) || {};
            return {
                questionId: qh.questionId,
                content: questionDetail.content,
                selectedAnswer: qh.selectedAnswer,
            };
        });

        res.json({
            userName: testHistory.userId.fullName,
            testTitle: testHistory.testId.title,
            questions: response,
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Lỗi server." });
    }
};

const submitTest = async (req, res, next) => {
  try {
    const { userId, testId } = req.params;
    const { answers, userInfo } = req.body;

        const test = await Tests.findById(testId);
        console.log("Ten bai kiem tra", test.title);

        const testName = test.title;

        const newTestHistory = new TestHistory({
            userId,
            testId,
            questions: answers.map((answer) => ({
                questionId: answer.questionId,
                selectedAnswer: {
                    answer: answer.selectedAnswer,
                },
            })),
            score: 0,
        });

        const savedTestHistory = await newTestHistory.save();

        const totalScore = await calculateScore(savedTestHistory, answers);
        console.log("Tong diem", totalScore);

        const resultText = await getTestOutcome(totalScore, testId);

        savedTestHistory.score = totalScore;

    if (userInfo) {
        console.log("name: " , userInfo.name);
        // const commentAi = "comment Ai lỗi";
      const commentAi = await commentAI(answers, testName);
      savedTestHistory.commentAI = commentAi;
      console.log("Chuẩn bị gửi mail");
      const mailService = MailService();
      await mailService.sendEmail(userInfo.mail, userInfo.name, commentAi, actions.SUBMIT_TEST);
      console.log("Gui mail thanh cong");
    }

    // await savedTestHistory.save();

    res.json({
      userName: savedTestHistory.userId.fullName,
      testTitle: savedTestHistory.testId.title,
      score: totalScore,
      result: resultText,
      questions: savedTestHistory.questions,
     commentAI: savedTestHistory.commentAI,
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Lỗi server." });
  }
};

const calculateScore = async (testHistory, answers) => {
    const questionIds = testHistory.questions.map((q) => q.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    let totalScore = 0;

    // Duyệt qua các câu trả lời của người dùng
    answers.forEach((answer) => {
        const question = questions.find((q) => q._id.equals(answer.questionId));
        if (question) {
            const correctAnswer = question.answers.find((a) => a.content === answer.selectedAnswer);
            if (correctAnswer) {
                totalScore += correctAnswer.point; // Cộng điểm cho câu trả lời đúng
            }
        }
    });

    return totalScore;
};

const getTestOutcome = async (totalScore, testId) => {
    const test = await Tests.findById(testId);
    const testOutcomes = test.testOutcomes;

    let resultText = "Không xác định"; // Biến lưu kết quả

    // Duyệt qua các testOutcome để xác định kết quả
    for (const outcome of testOutcomes) {
        if (totalScore >= outcome.minScore && totalScore <= outcome.maxScore) {
            resultText = outcome.description;
            break;
        }
    }

    return resultText;
};

const commentAI = async (questionAndAnswer, testName) => {
    try {
        console.log("Câu hỏi và câu trả lời gửi đi AI:", questionAndAnswer);

        const questionAnswerText = JSON.stringify(questionAndAnswer);
        const prompt = `Dưới đây là câu hỏi và câu trả lời của bài kiểm tra tâm lý ${testName}:

    ${questionAnswerText}
    
    Dựa trên các câu trả lời và kết quả kiểm tra của người dùng, hãy cung cấp các thông tin sau:
    
    1. **Lời khuyên** về việc chăm sóc và cải thiện:
       - Cung cấp các lời khuyên chi tiết về cách chăm sóc bản thân và cải thiện tình trạng tâm lý hiện tại của người dùng dựa trên câu trả lời của họ.
    
    2. **Phương pháp** cải thiện tình trạng:
       - Đưa ra các phương pháp cụ thể và khoa học để cải thiện tình trạng của người dùng, bao gồm các hoạt động, thói quen, hoặc kỹ thuật mà người dùng có thể áp dụng trong cuộc sống hàng ngày.
    
    3. **Tiến trình phục hồi**:
       - Dựa trên các câu trả lời của người dùng, mô tả một tiến trình phục hồi hợp lý, bao gồm các bước cụ thể mà người dùng có thể thực hiện để tiến gần hơn đến sự cải thiện tâm lý lâu dài.
    
    **Lưu ý**:
    - Hãy cung cấp lời khuyên, phương pháp và tiến trình phục hồi một cách chi tiết, có khoa học, dễ áp dụng và phù hợp với những câu trả lời mà người dùng đã chọn trong bài kiểm tra.
    `;
    // console.log("GPT_API_KEY:", process.env.API_KEY_GPT);
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.API_KEY_GPT}`,
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                max_tokens: 1000,
                temperature: 0.7,
            }),
        });

        if (!response.ok)
            // console.error("Lỗi API OpenAI:", await response.text());
            throw new Error("Error fetching response from OpenAI API");

        // Nhận kết quả từ OpenAI API
        const data = await response.json();
        const aiMessage = data.choices[0].message.content.trim();

        console.log("Phản hồi từ OpenAI:", aiMessage);

        return aiMessage;
    } catch (error) {
        console.error("Error getting feedback from AI:", error);
        throw new Error("Không thể lấy phản hồi từ AI.");
    }
};

export default {
    getUserAnswerForQuestion,
    submitTest,
};
