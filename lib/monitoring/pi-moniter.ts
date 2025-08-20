export class RaspberryPiMonitor {
  static async getSystemStats() {
    try {
      // This would typically call a monitoring endpoint on the Pi
      const response = await fetch('http://raspberrypi.local:8080/stats')
      return await response.json()
    } catch (error) {
      return {
        cpu: 0,
        memory: 0,
        temperature: 0,
        available: false
      }
    }
  }

  static async getLLMStats() {
    try {
      const response = await fetch('http://raspberrypi.local:11434/api/ps')
      const models = await response.json()
      
      return {
        modelsLoaded: models.models?.length || 0,
        totalSize: models.models?.reduce((sum: number, m: any) => sum + m.size, 0) || 0,
        available: true
      }
    } catch (error) {
      return {
        modelsLoaded: 0,
        totalSize: 0,
        available: false
      }
    }
  }
}