import { Context, Schema } from 'koishi'

export const name = 'yoake-weather-xinzhi'

export interface Config {
  key: string
}

export const Config: Schema<Config> = Schema.object({
  key: Schema.string().description("请配置心知天气得到的私钥").role('secret').required(),
})

export function apply(ctx: Context,config:Config) {
  ctx.command('weather <message:text>','请输入城市名')
  .example('weather 广州')
  .action(async (_,message)=>{
    //访问心知天气api
    try{
      if(message==null||message==undefined) return '请输入具体城市名称！'
      let weather = await ctx.http.get(`https://api.seniverse.com/v3/weather/now.json?key=${config.key}&location=${message}&language=zh-Hans&unit=c`)
      let now = weather.results[0].now
      return `${message}的天气为${now.text},当前气温是${now.temperature}℃`
       
    }catch(e){
      if(e.response.status==404){
        return '所查询的城市不存在'
      }
      else if(e.response.status==403){
        ctx.logger.error('所填入的私钥不对，请重新写入正确的私钥')
        return
      }
      ctx.logger.error(e)
      return  '发生其他错误，请联系管理员！'
    }
  })
}
