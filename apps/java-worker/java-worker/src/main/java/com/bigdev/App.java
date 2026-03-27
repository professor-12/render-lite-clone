package com.bigdev;

public class App {
  public static void main(String[] args) throws Exception {
    Worker.fromEnv().startForever();
  }
}
