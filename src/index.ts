import { Context, Schema } from 'koishi'

export const name = 'yoake-weather-xinzhi'

export interface Config {
  key: string
}

export const Config: Schema<Config> = Schema.object({
  key: Schema.string().description("请配置心知天气得到的私钥").role('secret').required(),
})

export function apply(ctx: Context, config: Config) {
  // Current weather command
  ctx.command('weather <message:text>', '请输入城市名')
    .example('weather 广州')
    .action(async (_, message) => {
      try {
        if (!message) return '请输入具体城市名称！'
        
        const weather = await ctx.http.get(`https://api.seniverse.com/v3/weather/now.json?key=${config.key}&location=${message}&language=zh-Hans&unit=c`)
        const now = weather.results[0].now
        return `${message}的天气为${now.text},当前气温是${now.temperature}℃`

      } catch (e) {
        if (e.response?.status == 404) {
          return '所查询的城市不存在'
        } else if (e.response?.status == 403) {
          ctx.logger.error('所填入的私钥不对，请重新写入正确的私钥')
          return '私钥错误，请检查并重新配置'
        }
        ctx.logger.error(e)
        return '发生其他错误，请联系管理员！'
      }
    })

  // Future 4 days weather command
  ctx.command('weather-forecast <message:text>', '请输入城市名，查询未来4天的天气')
    .example('weather-forecast 北京')
    .action(async (_, message) => {
      try {
        if (!message) return '请输入具体城市名称！'
        
        const forecast = await ctx.http.get(`https://api.seniverse.com/v3/weather/daily.json?key=${config.key}&location=${message}&language=zh-Hans&unit=c&start=0&days=5`)
        const dailyWeather = forecast.results[0].daily
        const forecastList = dailyWeather.map((day) => {
          return `日期: ${day.date}，白天气温: ${day.high}℃，夜间气温: ${day.low}℃，天气: ${day.text_day}，风速: ${day.wind_speed} km/h`
        }).join('\n')

        return `未来3天的天气：\n${forecastList}`

      } catch (e) {
        if (e.response?.status == 404) {
          return '所查询的城市不存在'
        } else if (e.response?.status == 403) {
          ctx.logger.error('所填入的私钥不对，请重新写入正确的私钥')
          return '私钥错误，请检查并重新配置'
        }
        ctx.logger.error(e)
        return '发生其他错误，请联系管理员！'
      }
    })
}
