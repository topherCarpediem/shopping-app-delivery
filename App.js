import React, { Component } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Vibration, ActivityIndicator, Modal, Image, Alert } from "react-native";
import { RNCamera } from 'react-native-camera';

import Icon from "react-native-vector-icons/FontAwesome";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

import axios from "axios"
import { apiUri } from "./config";

export default class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      isScanning: false,
      deliveryCode: "",
      pickUpCode: "",
      modalVisible: false,
      loading: false,
      typeOfAction: "",
      data: {
        product: {
          imageCover: "",
          productName: "",
          productPrice: ""
        }
      }
    }
  }

  _handleBarCodeRead(e) {
    Vibration.vibrate();
    //this.setState({ scanning: false });
    //Linking.openURL(e.data).catch(err => console.error('An error occured', err));
    this.setState({
      isScanning: false,
      deliveryCode: e.data,
      loading: true
    })

    axios.get(`${apiUri}/product/order/${e.data}`, {
      headers: {
        "Content-type": "application/json"
      }
    }).then(result => {
      this.setState({
        loading: false,
        modalVisible: true,
        data: result.data
      })

    }).catch(err => {
      this.setState({
        loading: false
      })
    })

    //alert(e.data)
    return;
  }

  _onPickUp() {
    this.setState({
      isScanning: true,
      typeOfAction: "pickup"
    })
  }

  setModalVisible(status) {
    this.setState({
      modalVisible: status
    })
  }

  _confirmPickUp() {
    this.setState({
      modalVisible: false,
      loading: true
    })
    axios.put(`${apiUri}/product/pickup/${this.state.data.id}`, {}, {
      headers: {
        "Content-type": "application/json"
      }
    }).then(result => {
      this.setState({
        loading: false
      })
      Alert.alert('Success', result.data.message)
    }).catch(err => {
      this.setState({
        loading: false
      })
    })
  }

  _confirmDeliver() {
    this.setState({
      modalVisible: false,
      loading: true
    })
    axios.put(`${apiUri}/product/deliver/${this.state.data.id}`, {}, {
      headers: {
        "Content-type": "application/json"
      }
    }).then(result => {
      this.setState({
        loading: false
      })
      Alert.alert('Success', result.data.message)
    }).catch(err => {
      this.setState({
        loading: false
      })
    })
  }

  render() {
    return (
      <View style={styles.container}>
        {
          this.state.isScanning === true
            ?
            <View style={{ flex: 1 }}>
              <RNCamera
                ref={ref => {
                  this.camera = ref;
                }}
                onBarCodeRead={this._handleBarCodeRead.bind(this)}
                style={styles.preview}
                type={RNCamera.Constants.Type.back}
                flashMode={RNCamera.Constants.FlashMode.on}
                permissionDialogTitle={'Permission to use camera'}
                permissionDialogMessage={'We need your permission to use your camera phone'}
              />
              <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center', }}>
                <TouchableOpacity
                  onPress={() => { this.setState({ isScanning: false }) }}
                  style={styles.capture}>
                  <Text style={{ fontSize: 14 }}> BACK </Text>
                </TouchableOpacity>
              </View>
            </View>
            :
            <View style={styles.itemContainer}>

              <View style={styles.item}>
                <TouchableOpacity onPress={this._onPickUp.bind(this)}>
                  <Icon name="truck" size={120} style={{ padding: 25 }} color="white" />
                  <Text style={{ textAlign: "center", color: "white", fontSize: 20, paddingBottom: 10 }}>Pick up</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.item}>
                <TouchableOpacity onPress={() => { this.setState({ isScanning: true, typeOfAction: "deliver" }) }}>
                  <MaterialCommunityIcons name="truck-delivery" size={120} style={{ padding: 25 }} color="white" />
                  <Text style={{ textAlign: "center", color: "white", fontSize: 20, paddingBottom: 10 }}>Deliver</Text>
                </TouchableOpacity>
              </View>
            </View>
        }

        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => { }}>

          <View style={{ flex: 1, backgroundColor: "black", opacity: 0.6 }}></View>

          <View style={styles.modalContainer}>

            <View style={{ flexDirection: "row", margin: 20, justifyContent: "center", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Image source={{
                  uri: this.state.data.product.imageCover,
                  headers: {
                    "Authorization": `Bearer ${this.state.token}`
                  }
                }}
                  style={{ width: 140, height: 150, borderRadius: 10, }}
                />


              </View>
              <View style={{ flex: 1 }}>
                <Text>{this.state.data.product.productName}</Text>
                <Text >Price: &#8369; {this.state.data.product.productPrice}</Text>
                <View style={{ flexDirection: "row" }}>
                  <Text >Stocks: </Text>
                  <Text >{this.state.data.product.stocks}</Text>
                </View>
                <Text>Status: <Text>{this.state.data.orderStatus}</Text></Text>
              </View>
            </View>

            {/* Buttons add to Cart and Cancel */}
            <View style={styles.modalButtonContainer}>
              <View style={{ backgroundColor: '#1abc9c', flex: 1, justifyContent: "center", alignItems: "center" }}>
                <TouchableOpacity style={{ padding: 18 }} onPress={() => { this.setModalVisible(false) }}>
                  <Text style={{ color: "white", fontSize: 15 }}>CANCEL</Text>
                </TouchableOpacity>
              </View>

              <View style={{ backgroundColor: '#e74c3c', flex: 1, justifyContent: "center", alignItems: "center" }}>
                {
                  this.state.typeOfAction === "pickup"
                    ?
                    <TouchableOpacity style={{ padding: 18 }}
                      onPress={() => { this._confirmPickUp() }} >
                      <Text style={{ color: "white", fontSize: 15 }}>PICKUP</Text>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity style={{ padding: 18 }}
                      onPress={() => { this._confirmDeliver() }} >
                      <Text style={{ color: "white", fontSize: 15 }}>DELIVER</Text>
                    </TouchableOpacity>
                }
              </View>

            </View>
            {/* End of Buttons add to Cart and Cancel */}

          </View>


        </Modal>
        {
          this.state.loading &&
          <View style={styles.loading}>
            <View style={{ backgroundColor: "white", padding: 20, borderRadius: 5 }}>
              <ActivityIndicator size={80} color="#e74c3c" />
            </View>
          </View>
        }

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white'
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  capture: {
    flex: 0,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20
  },
  item: {
    backgroundColor: "#e74c3c",
    margin: 5,
    borderRadius: 30
  },
  itemContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

  },
  modalButtonContainer: {
    flexDirection: "row",
    flex: 1,
    position: 'absolute',
    bottom: 0,
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.8,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white"
  }
});

