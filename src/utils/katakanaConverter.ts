import axios from 'axios';
import { isKatakana, toKatakana as wanakana } from 'wanakana';

const URL_CONVERT_KATAKANA = 'https://dc3i1t2n86q86.cloudfront.net/toKatakana';

const toConvertKatakana = async (text: string) => {
  try {
    const response = await axios.post(
      URL_CONVERT_KATAKANA,
      {
        message: text,
      },
      {}
    );
    const res = response?.data?.res;

    if (!isKatakana(res)) {
      return wanakana(res);
    }

    return res;
  } catch (e) {
    return wanakana(text);
  }
};

export { toConvertKatakana };
