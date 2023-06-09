import "./App.css";
import Main from "./components/main";
import "./styles.css";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import Cart from "./components/cart";
import Order from './components/order';
import Message from "./components/message";
import Recent from './components/recent';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/cart" exact component={Cart} />
        <Route path='/order' exact component={Order} />
        <Route path='/message' exact component={Message} />
        <Route path='/recent' exact component={Recent} />
        <Route path="/" exact component={Main} />
        <Redirect to="/" />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
