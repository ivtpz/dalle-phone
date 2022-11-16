import axios from 'axios';

const fetcher = (...args: Parameters<typeof axios.get>) =>
  axios.get(...args).then((res) => res.data);

export default fetcher;
