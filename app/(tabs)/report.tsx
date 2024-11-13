import * as React from "react";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

const DashboardReport = () => {
  return (
    <View style={styles.dashboardReport}>

      <View style={[styles.background, styles.backgroundLayout1]} />
      <View style={[styles.background1, styles.backgroundLayout1]} />
      <View style={[styles.background2, styles.backgroundLayout1]} />
      <View style={[styles.background3, styles.backgroundLayout]} />
      <View style={[styles.background4, styles.backgroundLayout]} />
      <Text style={[styles.details, styles.detailsTypo4]}>Early WORMS</Text>
      <Text style={[styles.details1, styles.detailsTypo4]}>Early Leavers</Text>
      <Text style={[styles.details2, styles.detailsTypo4]}>Late comers</Text>
      <Text style={[styles.details3, styles.detailsTypo4]}>Daily Attendance</Text>
      <Text style={[styles.details4, styles.detailsTypo4]}>Monthly Attendance</Text>
      <View style={[styles.row5, styles.rowShadowBox1]} />
      <View style={[styles.row51, styles.rowShadowBox1]} />
      <View style={[styles.row52, styles.rowShadowBox]} />
      <View style={[styles.row53, styles.rowShadowBox1]} />
      <View style={[styles.row54, styles.rowShadowBox]} />
      <Text style={[styles.details5, styles.detailsTypo3]}>G1</Text>
      <Text style={[styles.details6, styles.detailsTypo2]}>Top Section</Text>
      <Text style={[styles.details7, styles.detailsTypo1]}>G1</Text>
      <Text style={[styles.details8, styles.detailsTypo]}>Top Section</Text>
      <Text style={[styles.details9, styles.detailsTypo1]}>G1</Text>
      <Text style={[styles.details10, styles.detailsTypo]}>Top Section</Text>
      <Text style={[styles.details11, styles.detailsTypo3]}>G2</Text>
      <Text style={[styles.details12, styles.detailsTypo2]}>Top Section</Text>
      <Text style={[styles.details13, styles.detailsTypo3]}>G1</Text>
      <Text style={[styles.details14, styles.detailsTypo2]}>Top Section</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  iconPosition: {
    height: 21,
    top: 44,
    position: "absolute",
  },
  iconLayout: {
    maxHeight: "100%",
    maxWidth: "100%",
    position: "absolute",
    overflow: "hidden",
  },
  homeTypo: {
    textAlign: "center",
    fontFamily: "Montserrat-Medium",
    fontWeight: "500",
    letterSpacing: 1.2,
    fontSize: 17,
  },
  homePosition: {
    top: 23,
    position: "absolute",
  },
  groupLayout: {
    height: 5,
    backgroundColor: "#f5c722",
    width: 50,
    left: 0,
    position: "absolute",
  },
  backgroundLayout1: {
    height: 140,
    width: 140,
    backgroundColor: "#d9d9d9",
    borderRadius: 5,
    left: 25,
    position: "absolute",
  },
  backgroundLayout: {
    height: 220,
    width: 140,
    backgroundColor: "#d9d9d9",
    borderRadius: 5,
    position: "absolute",
  },
  detailsTypo4: {
    height: 14,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    letterSpacing: 0.9,
    fontSize: 12,
    textAlign: "center",
    color: "#000",
    fontFamily: "Montserrat-Medium",
    fontWeight: "500",
    position: "absolute",
  },
  rowShadowBox1: {
    height: 62,
    width: 140,
    backgroundColor: "#8a252c",
    shadowOpacity: 1,
    elevation: 4,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowColor: "rgba(0, 0, 0, 0.25)",
    position: "absolute",
  },
  rowShadowBox: {
    top: 473,
    height: 62,
    width: 140,
    backgroundColor: "#8a252c",
    shadowOpacity: 1,
    elevation: 4,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowColor: "rgba(0, 0, 0, 0.25)",
    position: "absolute",
  },
  detailsTypo3: {
    textShadowRadius: 4,
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowColor: "#fcb308",
    height: 34,
    color: "#fcb308",
    letterSpacing: 2.4,
    fontSize: 32,
    width: 121,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    textAlign: "center",
    fontFamily: "Montserrat-Medium",
    fontWeight: "500",
    position: "absolute",
  },
  detailsTypo2: {
    color: "#fff",
    height: 14,
    width: 121,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    letterSpacing: 0.9,
    fontSize: 12,
    textAlign: "center",
    fontFamily: "Montserrat-Medium",
    fontWeight: "500",
    position: "absolute",
  },
  detailsTypo1: {
    top: 496,
    textShadowRadius: 4,
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowColor: "#fcb308",
    height: 34,
    color: "#fcb308",
    letterSpacing: 2.4,
    fontSize: 32,
    width: 121,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    textAlign: "center",
    fontFamily: "Montserrat-Medium",
    fontWeight: "500",
    position: "absolute",
  },
  detailsTypo: {
    top: 478,
    color: "#fff",
    height: 14,
    width: 121,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    letterSpacing: 0.9,
    fontSize: 12,
    textAlign: "center",
    fontFamily: "Montserrat-Medium",
    fontWeight: "500",
    position: "absolute",
  },
  navIcon: {
    top: 32,
    borderRadius: 11,
    height: 47,
    left: 0,
    width: 349,
    position: "absolute",
  },
  rollIcon: {
    top: -1,
    left: 172,
    width: 90,
    height: 74,
    position: "absolute",
  },
  scheduleIcon: {
    left: 284,
    width: 22,
  },
  reportIcon: {
    height: "23.52%",
    width: "6.19%",
    top: "38.07%",
    right: "34.32%",
    bottom: "38.41%",
    left: "59.49%",
  },
  homeIcon: {
    height: "26.19%",
    width: "7.65%",
    top: "50.98%",
    right: "79.74%",
    bottom: "22.83%",
    left: "12.61%",
  },
  report: {
    top: 76,
    left: 186,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: {
      width: 0,
      height: 1.1136890649795532,
    },
    textShadowRadius: 6.96,
    color: "#000",
    textAlign: "center",
    fontFamily: "Montserrat-Medium",
    fontWeight: "500",
    letterSpacing: 1.2,
    fontSize: 17,
    position: "absolute",
  },
  roomIcon: {
    left: 124,
    width: 21,
  },
  navigation: {
    top: 540,
    left: 6,
    height: 86,
    width: 349,
    position: "absolute",
  },
  dashboardReportChild: {
    width: 360,
    height: 67,
    backgroundColor: "#8a252c",
    shadowOpacity: 1,
    elevation: 4,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowColor: "rgba(0, 0, 0, 0.25)",
    top: 0,
    left: 0,
    position: "absolute",
  },
  image1Icon: {
    top: 8,
    left: 290,
    borderRadius: 25,
    height: 50,
    width: 50,
    position: "absolute",
  },
  groupChild: {
    top: 0,
    backgroundColor: "#f5c722",
  },
  groupItem: {
    top: 10,
  },
  groupInner: {
    top: 20,
  },
  rectangleParent: {
    left: 20,
    height: 25,
    width: 50,
  },
  home: {
    left: 146,
    color: "#f5c722",
    textAlign: "center",
    fontFamily: "Montserrat-Medium",
    fontWeight: "500",
    letterSpacing: 1.2,
    fontSize: 17,
    top: 23,
  },
  background: {
    top: 84,
  },
  background1: {
    top: 250,
  },
  background2: {
    top: 416,
  },
  background3: {
    left: 190,
    top: 84,
  },
  background4: {
    top: 336,
    left: 192,
  },
  details: {
    width: 121,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    letterSpacing: 0.9,
    fontSize: 12,
    left: 34,
    top: 89,
  },
  details1: {
    top: 257,
    width: 121,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    letterSpacing: 0.9,
    fontSize: 12,
    left: 34,
  },
  details2: {
    top: 423,
    width: 121,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    letterSpacing: 0.9,
    fontSize: 12,
    left: 34,
  },
  details3: {
    left: 199,
    width: 121,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    letterSpacing: 0.9,
    fontSize: 12,
    top: 89,
  },
  details4: {
    top: 345,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    letterSpacing: 0.9,
    fontSize: 12,
    left: 192,
    width: 140,
  },
  row5: {
    top: 143,
    left: 25,
  },
  row51: {
    top: 308,
    left: 25,
  },
  row52: {
    left: 192,
  },
  row53: {
    top: 219,
    left: 190,
  },
  row54: {
    left: 25,
  },
  details5: {
    top: 166,
    left: 34,
  },
  details6: {
    top: 148,
    left: 34,
  },
  details7: {
    left: 34,
  },
  details8: {
    left: 34,
  },
  details9: {
    left: 199,
  },
  details10: {
    left: 199,
  },
  details11: {
    top: 331,
    left: 34,
  },
  details12: {
    top: 313,
    left: 34,
  },
  details13: {
    top: 242,
    left: 199,
  },
  details14: {
    top: 224,
    left: 199,
  },
  dashboardReport: {
    backgroundColor: "#fff",
    flex: 1,
    width: "100%",
    height: 640,
    overflow: "hidden",
  },
});

export default DashboardReport;
