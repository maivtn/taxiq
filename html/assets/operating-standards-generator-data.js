// Content and conditional rule selection from TurnBoardBanMau (3).html.
(function () {
  'use strict';
  const ruleBank = [
  {
    "s": "Trước khi đến tiệm",
    "t": "Xem lịch làm việc và lịch hẹn của mình trước 8 giờ tối hôm trước.",
    "w": {}
  },
  {
    "s": "Trước khi đến tiệm",
    "t": "Xin nghỉ báo trước ít nhất 24 giờ. Nghỉ đột xuất phải gọi trực tiếp quản lý, không nhắn tin rồi thôi.",
    "w": {}
  },
  {
    "s": "Trước khi đến tiệm",
    "t": "Xin nghỉ báo trước ít nhất 48 giờ; cuối tuần và ngày lễ báo trước 1 tuần.",
    "w": {
      "strict": [
        "hard"
      ]
    }
  },
  {
    "s": "Trước khi đến tiệm",
    "t": "Đi trễ báo trước ít nhất 30 phút để lễ tân xếp lại turn cho tiệm.",
    "w": {}
  },
  {
    "s": "Trước khi đến tiệm",
    "t": "Có mặt trước giờ mở cửa 10 phút để dọn bàn và chuẩn bị dụng cụ.",
    "w": {}
  },
  {
    "s": "Trước khi đến tiệm",
    "t": "Có mặt trước giờ mở cửa 20 phút; tiệm đông nên cần đủ người ngay khi mở.",
    "w": {
      "size": [
        "lg"
      ]
    }
  },
  {
    "s": "Trước khi đến tiệm",
    "t": "Trang phục theo quy định của tiệm, gọn gàng, giày kín mũi.",
    "w": {
      "strict": [
        "mid",
        "hard"
      ]
    }
  },
  {
    "s": "Trước khi đến tiệm",
    "t": "Đồng phục và bảng tên bắt buộc trong suốt ca làm.",
    "w": {
      "svc": [
        "spa"
      ]
    }
  },
  {
    "s": "Check-in và thứ tự turn",
    "t": "Quét mã QR check-in ngay khi tới tiệm. Chưa check-in là chưa vào hàng chia turn.",
    "w": {}
  },
  {
    "s": "Check-in và thứ tự turn",
    "t": "Thứ tự turn tính theo giờ check-in — ai tới trước đứng trước.",
    "w": {}
  },
  {
    "s": "Check-in và thứ tự turn",
    "t": "Đi ăn hoặc có việc riêng phải bấm tạm nghỉ; quay lại bấm có mặt để vào lại hàng.",
    "w": {}
  },
  {
    "s": "Check-in và thứ tự turn",
    "t": "Không tự đổi turn với nhau khi chưa hỏi lễ tân.",
    "w": {}
  },
  {
    "s": "Check-in và thứ tự turn",
    "t": "Check-in hộ người khác là vi phạm nặng, xử lý ngay lần đầu.",
    "w": {
      "strict": [
        "mid",
        "hard"
      ]
    }
  },
  {
    "s": "Check-in và thứ tự turn",
    "t": "Khách walk-in đông: giữ máy bên mình để nghe thông báo tới lượt.",
    "w": {
      "flow": [
        "walk",
        "both"
      ]
    }
  },
  {
    "s": "Check-in và thứ tự turn",
    "t": "Khách có hẹn được ưu tiên đúng giờ hẹn, thợ đang rảnh phải sẵn sàng nhận.",
    "w": {
      "flow": [
        "appt",
        "both"
      ]
    }
  },
  {
    "s": "Trong giờ làm việc",
    "t": "Dọn sạch bàn sau mỗi khách, trước khi nhận khách kế.",
    "w": {}
  },
  {
    "s": "Trong giờ làm việc",
    "t": "Khử trùng dụng cụ đúng quy định — đây là điều kiện giữ giấy phép của tiệm.",
    "w": {}
  },
  {
    "s": "Trong giờ làm việc",
    "t": "Không rời tiệm trong giờ làm mà không báo quản lý.",
    "w": {}
  },
  {
    "s": "Trong giờ làm việc",
    "t": "Đang có khách chờ thì không ngồi không — hỏi lễ tân xem cần phụ gì.",
    "w": {
      "flow": [
        "walk",
        "both"
      ]
    }
  },
  {
    "s": "Trong giờ làm việc",
    "t": "Ghi đúng dịch vụ đã làm vào ticket ngay khi xong, không để dồn cuối ngày.",
    "w": {}
  },
  {
    "s": "Trong giờ làm việc",
    "t": "Đeo khẩu trang và bật hút bụi khi làm bột, dũa, hoặc dùng hóa chất mạnh.",
    "w": {}
  },
  {
    "s": "Trong giờ làm việc",
    "t": "Kiểm tra dị ứng và tình trạng móng của khách trước khi làm waxing hoặc hóa chất.",
    "w": {
      "svc": [
        "wax"
      ]
    }
  },
  {
    "s": "Trong giờ làm việc",
    "t": "Trẻ em phải có người lớn đi kèm ngồi cạnh trong suốt buổi làm.",
    "w": {
      "svc": [
        "kid"
      ]
    }
  },
  {
    "s": "Trong giờ làm việc",
    "t": "Giữ không gian yên tĩnh: nói nhỏ, không mở nhạc riêng, không gọi nhau qua phòng.",
    "w": {
      "svc": [
        "spa"
      ]
    }
  },
  {
    "s": "Ăn uống và nghỉ ngơi",
    "t": "Ăn ở khu vực dành riêng. Không ăn tại bàn làm việc hoặc trước mặt khách.",
    "w": {}
  },
  {
    "s": "Ăn uống và nghỉ ngơi",
    "t": "Giờ ăn xoay ca để tiệm luôn có thợ. Báo lễ tân trước khi đi ăn.",
    "w": {}
  },
  {
    "s": "Ăn uống và nghỉ ngơi",
    "t": "Nước uống phải có nắp đậy mới được để ở bàn làm việc.",
    "w": {}
  },
  {
    "s": "Ăn uống và nghỉ ngơi",
    "t": "Nghỉ giữa ca tối đa 30 phút; quá giờ phải báo quản lý.",
    "w": {
      "strict": [
        "mid",
        "hard"
      ]
    }
  },
  {
    "s": "Ăn uống và nghỉ ngơi",
    "t": "Tiệm đông: tối đa 2 thợ đi ăn cùng lúc, lễ tân duyệt trước.",
    "w": {
      "size": [
        "lg"
      ]
    }
  },
  {
    "s": "Ăn uống và nghỉ ngơi",
    "t": "Không mang đồ ăn nặng mùi vào khu vực khách ngồi.",
    "w": {}
  },
  {
    "s": "Giao tiếp với khách",
    "t": "Chào khách khi khách bước vào, kể cả không phải khách của mình.",
    "w": {}
  },
  {
    "s": "Giao tiếp với khách",
    "t": "Không bàn chuyện giá cả, tiền tip, hay chuyện nội bộ tiệm với khách.",
    "w": {}
  },
  {
    "s": "Giao tiếp với khách",
    "t": "Khách không hài lòng: báo quản lý ngay, tuyệt đối không tranh cãi với khách.",
    "w": {}
  },
  {
    "s": "Giao tiếp với khách",
    "t": "Không hứa với khách những gì ngoài thẩm quyền (giảm giá, làm thêm miễn phí).",
    "w": {}
  },
  {
    "s": "Giao tiếp với khách",
    "t": "Nói tiếng Anh khi phục vụ khách nước ngoài. Hạn chế nói chuyện riêng bằng tiếng Việt trước mặt khách.",
    "w": {
      "en": [
        "high"
      ]
    }
  },
  {
    "s": "Giao tiếp với khách",
    "t": "Không nói tiếng Việt về khách khi khách đang ngồi — dù khách không hiểu.",
    "w": {
      "en": [
        "high"
      ]
    }
  },
  {
    "s": "Giao tiếp với khách",
    "t": "Hỏi lại khách về mẫu, độ dài, màu trước khi bắt đầu để tránh làm lại.",
    "w": {}
  },
  {
    "s": "Giao tiếp với khách",
    "t": "Tư vấn thêm dịch vụ là được, nhưng khách từ chối một lần thì dừng.",
    "w": {
      "svc": [
        "retail"
      ]
    }
  },
  {
    "s": "Giao tiếp với khách",
    "t": "Giới thiệu sản phẩm bán lẻ đúng nhu cầu khách, không ép mua.",
    "w": {
      "svc": [
        "retail"
      ]
    }
  },
  {
    "s": "Giao tiếp với đồng nghiệp, lễ tân, quản lý",
    "t": "Thắc mắc về turn: hỏi lễ tân trước. Không cãi nhau trước mặt khách.",
    "w": {}
  },
  {
    "s": "Giao tiếp với đồng nghiệp, lễ tân, quản lý",
    "t": "Vẫn còn bất đồng: gặp riêng quản lý lúc vắng khách hoặc sau giờ làm.",
    "w": {}
  },
  {
    "s": "Giao tiếp với đồng nghiệp, lễ tân, quản lý",
    "t": "Không nói xấu tay nghề đồng nghiệp với khách hoặc với thợ khác.",
    "w": {}
  },
  {
    "s": "Giao tiếp với đồng nghiệp, lễ tân, quản lý",
    "t": "Nhận khách từ lễ tân. Không tự nhận khách khi chưa được giao.",
    "w": {}
  },
  {
    "s": "Giao tiếp với đồng nghiệp, lễ tân, quản lý",
    "t": "Phụ nhau lúc đông khách — tiệm chạy được thì turn ai cũng nhiều hơn.",
    "w": {
      "size": [
        "md",
        "lg"
      ]
    }
  },
  {
    "s": "Giao tiếp với đồng nghiệp, lễ tân, quản lý",
    "t": "Thợ mới có thợ kèm trong tháng đầu; thợ kèm chịu trách nhiệm chất lượng.",
    "w": {
      "size": [
        "md",
        "lg"
      ]
    }
  },
  {
    "s": "Điện thoại và mạng xã hội",
    "t": "Không dùng điện thoại khi đang làm khách.",
    "w": {}
  },
  {
    "s": "Điện thoại và mạng xã hội",
    "t": "Chụp hình tác phẩm phải xin phép khách trước.",
    "w": {}
  },
  {
    "s": "Điện thoại và mạng xã hội",
    "t": "Không quay/chụp khách hoặc chuyện nội bộ tiệm để đăng lên mạng.",
    "w": {}
  },
  {
    "s": "Điện thoại và mạng xã hội",
    "t": "Điện thoại để chế độ rung trong suốt ca làm.",
    "w": {
      "strict": [
        "mid",
        "hard"
      ]
    }
  },
  {
    "s": "Điện thoại và mạng xã hội",
    "t": "Không nhận khách riêng hoặc đưa số cá nhân cho khách của tiệm.",
    "w": {
      "strict": [
        "hard"
      ]
    }
  },
  {
    "s": "Tiền tip và thanh toán",
    "t": "Mọi thanh toán đi qua quầy. Không nhận tiền trực tiếp từ khách.",
    "w": {}
  },
  {
    "s": "Tiền tip và thanh toán",
    "t": "Tip là của thợ làm khách đó, tiệm không giữ.",
    "w": {}
  },
  {
    "s": "Tiền tip và thanh toán",
    "t": "Không gợi ý hay xin tip từ khách.",
    "w": {}
  },
  {
    "s": "Tiền tip và thanh toán",
    "t": "Tip chia theo tỷ lệ đã thỏa thuận khi nhiều thợ cùng làm một khách.",
    "w": {
      "size": [
        "md",
        "lg"
      ]
    }
  },
  {
    "s": "Vi phạm và xử lý",
    "t": "Lần 1 nhắc miệng, lần 2 ghi nhận, lần 3 xét lại vị trí làm việc.",
    "w": {
      "strict": [
        "soft",
        "mid"
      ]
    }
  },
  {
    "s": "Vi phạm và xử lý",
    "t": "Lần 1 ghi nhận bằng văn bản, lần 2 xét lại vị trí làm việc.",
    "w": {
      "strict": [
        "hard"
      ]
    }
  },
  {
    "s": "Vi phạm và xử lý",
    "t": "Vi phạm nặng xử lý ngay: bỏ khách giữa chừng, cãi nhau trước mặt khách, gian lận turn, vi phạm vệ sinh.",
    "w": {}
  },
  {
    "s": "Vi phạm và xử lý",
    "t": "Nội quy có thể được cập nhật; thợ phải đọc và xác nhận bản mới trong vòng 3 ngày.",
    "w": {}
  }
];
  const presets = [
  {
    "id": "std",
    "title": "Tiệm nail tiêu chuẩn",
    "description": "Bản cân bằng, hợp hầu hết tiệm 6–15 thợ.",
    "answers": {
      "size": "md",
      "flow": "both",
      "en": "high",
      "svc": [],
      "strict": "mid"
    }
  },
  {
    "id": "sm",
    "title": "Tiệm nhỏ 3–6 thợ",
    "description": "Gọn, ít điều, thoải mái hơn.",
    "answers": {
      "size": "sm",
      "flow": "both",
      "en": "low",
      "svc": [],
      "strict": "soft"
    }
  },
  {
    "id": "lg",
    "title": "Tiệm lớn, đông walk-in",
    "description": "Chặt chẽ hơn: ca kíp, hàng chờ, kèm thợ mới.",
    "answers": {
      "size": "lg",
      "flow": "walk",
      "en": "high",
      "svc": [],
      "strict": "hard"
    }
  },
  {
    "id": "spa",
    "title": "Nail & Spa cao cấp",
    "description": "Thêm chuẩn phục vụ, đồng phục, giữ yên tĩnh.",
    "answers": {
      "size": "md",
      "flow": "appt",
      "en": "high",
      "svc": [
        "spa",
        "wax",
        "retail"
      ],
      "strict": "hard"
    }
  }
];
  const questions = [
  {
    "id": "size",
    "title": "Tiệm bao nhiêu thợ",
    "options": [
      {
        "value": "sm",
        "label": "Dưới 6"
      },
      {
        "value": "md",
        "label": "6 – 15"
      },
      {
        "value": "lg",
        "label": "Trên 15"
      }
    ]
  },
  {
    "id": "flow",
    "title": "Khách chủ yếu",
    "options": [
      {
        "value": "walk",
        "label": "Walk-in"
      },
      {
        "value": "appt",
        "label": "Hẹn trước"
      },
      {
        "value": "both",
        "label": "Cả hai"
      }
    ]
  },
  {
    "id": "en",
    "title": "Khách nước ngoài / cần tiếng Anh",
    "options": [
      {
        "value": "low",
        "label": "Ít"
      },
      {
        "value": "high",
        "label": "Nhiều"
      }
    ]
  },
  {
    "id": "svc",
    "title": "Tiệm có thêm dịch vụ nào",
    "multiple": true,
    "options": [
      {
        "value": "kid",
        "label": "Trẻ em"
      },
      {
        "value": "wax",
        "label": "Waxing"
      },
      {
        "value": "spa",
        "label": "Spa / massage"
      },
      {
        "value": "retail",
        "label": "Bán lẻ sản phẩm"
      }
    ]
  },
  {
    "id": "strict",
    "title": "Mức độ chặt chẽ",
    "options": [
      {
        "value": "soft",
        "label": "Nhẹ nhàng"
      },
      {
        "value": "mid",
        "label": "Cân bằng"
      },
      {
        "value": "hard",
        "label": "Nghiêm"
      }
    ]
  }
];
  const defaultAnswers = {
  "size": "md",
  "flow": "both",
  "en": "high",
  "svc": [],
  "strict": "mid"
};

  function validateAnswers(answers) {
    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) return false;
    return questions.every(question => {
      const values = question.options.map(option => option.value);
      const answer = answers[question.id];
      return question.multiple
        ? Array.isArray(answer) && answer.every(value => values.includes(value))
        : values.includes(answer);
    });
  }
  function generate(answers = defaultAnswers) {
    if (!validateAnswers(answers)) throw new TypeError('Choose a valid answer for each operating standards question.');
    const groups = new Map();
    for (const rule of ruleBank) {
      const matches = Object.entries(rule.w).every(([key, values]) => key === 'svc'
        ? values.some(value => answers.svc.includes(value))
        : values.includes(answers[key]));
      if (!matches) continue;
      if (!groups.has(rule.s)) groups.set(rule.s, []);
      groups.get(rule.s).push(rule.t);
    }
    return Array.from(groups, ([title, rules], index) => ({id:'section-' + (index + 1), title, rules}));
  }
  window.NEXORA_STANDARD_GENERATOR = {presets, questions, defaultAnswers, validateAnswers, generate};
})();
