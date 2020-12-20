import { CountUp } from './plugins-init/countUp.js';
// overview
axios.get(`${protocol}//${domain}/admin/getOverviewData`)
  .then((response) => {
    const overviewData = response.data
    console.log(overviewData)

    // const dailySalesSpan = document.getElementById('daily-sales')
    const countUp = new CountUp('daily-sales', 13657);
    if (!countUp.error) {
      countUp.start();
    } else {
      console.error(countUp.error);
    }
    // dailySalesSpan.innerHTML = countUp.version


  })
