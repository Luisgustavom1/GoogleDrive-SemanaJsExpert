import AppController from "./src/appController.js";
import ConnectionManager from "./src/connectionManager.js";
import ViewManager from "./src/viewManager.js";

const API_URL = 'https://172.24.0.1:5000/';

const appController = new AppController({
    viewManager: new ViewManager(),
    connectionManager: new ConnectionManager({
        apiUrl: API_URL
    })
})

try {
    await appController.initialize()
} catch (error) {
    console.log('erros', error);
}
