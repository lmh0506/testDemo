import AMap from 'AMap'
import AMapStyle from './amap-style'

export class MapContainer {
  constructor (options) {
    // 逆地理编码实例
    this.geocoder = new AMap.Geocoder({
      city: '沈阳'
    })
    this.initMap(options)
    // 海量点实例集合
    this.massMarksMap = new Map()
    // 覆盖物集合实例集合
    this.overlayGroupMap = new Map()
    // 聚合覆盖物实例集合
    this.clusterMarkersMap = new Map()
  }

  /**
   *初始化地图
   * @param {Object} options 参数配置与高德的相同
   * @memberof MapContainer
   */
  initMap (options) {
    const map = new AMap.Map(
      options.target,
      Object.assign({
        zoom: options.zoom, // 级别
        center: options.center, // 中心点坐标
        viewMode: '3D', // 使用3D视图
        ...options
      })
    )
    this.map = map
  }
  /**
 * 添加海量点
 * @param {String} {type} 图层类型，用于管理多类型图标切换的情况
 * @param {Array} {data} 点位数据
 * @param {Object} {options} 高德MassMarks 类配置
 * @param {Function} {clickCallback} 点位点击后的回调
 * @memberof MapContainer
 */
  addMassMarks ({ type, data, options = {}, clickCallback }) {
    if (this.massMarksMap.has(type)) {
      const mass = this.massMarksMap.get(type)
      mass.setData(data)
    } else {
      const mass = new AMap.MassMarks(data, {
        zIndex: 999,
        ...options,
        style: AMapStyle[type]
      })

      clickCallback && mass.on('click', clickCallback)
      mass.setMap(this.map)
      this.massMarksMap.set(type, mass)
    }
  }
  /**
   * 添加聚合点位
   *
   * @param {Array} { data } 点位数据
   * @param {String} { type } 点位类型
   * @param {Object} { markerOpt } 点配置
   * @param {Function} { markerClickCallback } 坐标点点击回调
   * @param {Object} { options } 聚合配置
   * @memberof MapContainer
   */
  addMarkerClusterer ({ data, type = 'default', markerOpt, markerClickCallback, options }) {
    let markers = data.map(item => {
      let marker = new AMap.Marker({
        position: new AMap.LngLat(item.longitude, item.latitude),
        extData: item,
        icon: new AMap.Icon(AMapStyle.clusterMarker),
        ...markerOpt
      })

      markerClickCallback && marker.on('click', markerClickCallback)

      return marker
    })

    // clusterMarkersMap 分类管理聚合点数据
    let clusterMarkersMapVal = this.clusterMarkersMap.get(type)
    if (clusterMarkersMapVal) {
      clusterMarkersMapVal = clusterMarkersMapVal.concat(markers)
    }
    this.clusterMarkersMap.set(type, markers)

    if (this.clusterMarkers) {
      this.clusterMarkers.addMarkers(markers)
    } else {
      this.clusterMarkers = new AMap.MarkerClusterer(this.map, markers, {
        styles: AMapStyle.clusterStyle,
        ...options
      })
    }
  }

  /**
   *打开信息弹窗
   * @param {String/HTMLElement} { target } // 显示内容，可以是HTML要素字符串或者HTMLElement对象
   * @param {*} { longitude } // 经度
   * @param {*} { latitude } // 纬度
   * @param {Array} { offset } // 信息窗体显示位置偏移量。默认基准点为信息窗体的底部中心（若设置了anchor，则以anchor值为基准点）。
   * @param {Function} { closeCallback } // 关闭弹窗的回调
   * @memberof MapContainer
   */
  openInfoWindow ({ target, longitude, latitude, offset, closeCallback }) {
    const position = new AMap.LngLat(longitude, latitude)
    if (this.infoWindow) {
      this.infoWindow.setPosition(position)
      this.infoWindow.setContent(target)
    } else {
      this.infoWindow = new AMap.InfoWindow({
        isCustom: true, // 使用自定义窗体
        content: target,
        position,
        autoMove: true,
        closeWhenClickMap: true,
        offset: new AMap.Pixel(offset[0], offset[1])
      })
    }
    // 清除上一次的关闭回调
    this.infoWindow._oldCallback && this.infoWindow.off('close', this.infoWindow._oldCallback)
    // 将关闭回调保存下来
    this.infoWindow._oldCallback = closeCallback
    closeCallback && this.infoWindow.on('close', closeCallback)

    this.infoWindow.open(this.map, position)
  }

  // 移动地图到指定位置
  setCenterPosition (lnglat, zoom = 18) {
    this.map.setZoomAndCenter(zoom, lnglat)
  }

  /**
   * 绑定点击事件
   * @param {function} { clickCallBack }
   * @memberof MapContainer
   */
  bindClickEvent (clickCallBack) {
    this.map.on('click', clickCallBack)
  }
  /**
   * 解除绑定点击事件
   * @param {function} { clickCallBack }
   * @memberof MapContainer
   */
  unBindClickEvent (clickCallBack) {
    this.map.off('click', clickCallBack)
  }
  /**
   * 设置默认地图点位
   * @param {Number} {longitude} 经度
   * @param {Number} {latitude} 纬度
   * @param {Icon} {icon} 点位图标
   * @memberof MapContainer
   */
  setLocaltion ({
    longitude,
    latitude,
    icon = new AMap.Icon(AMapStyle.location),
    options
  }) {
    this.clearLocaltion()

    this.localtionMarker = new AMap.Marker({
      icon,
      position: new AMap.LngLat(longitude, latitude),
      ...options
    })
    this.localtionMarker.setMap(this.map)
  }
  // 清除定位点击点位
  clearLocaltion () {
    this.localtionMarker && this.localtionMarker.setMap(null)
    this.localtionMarker = null
  }

  /**
   * 经纬度转地址
   * @param {Array} {position} 点位坐标数据
   */
  getAddressByCenter (position) {
    return new Promise((resolve, reject) => {
      this.geocoder.getAddress(position, (status, result) => {
        if (status === 'complete') {
          resolve(result.regeocode)
        } else {
          reject(result)
        }
      })
    })
  }
}
