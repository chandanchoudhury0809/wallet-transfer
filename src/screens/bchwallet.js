import React, { useState } from "react";
import styled from "styled-components";
import { Form, Button } from "react-bootstrap";
import swal from "sweetalert";
import { sendBch, getBal } from "../functions/bchUtils";

const Bchwallet = () => {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [mnemonics, setMnemonic] = useState("");
  const handleSend = async (e) => {
    e.preventDefault();
    try {
      console.log("address =", address);
      console.log("amount =", address);
      console.log("mnemonics =", mnemonics);
      const txid = await sendBch(address, amount, mnemonics);
      swal({
        title: "Sent!!!",
        text: `Transaction successful. Transaction ID : ${txid}`,
        icon: "success",
      });
    } catch {
      swal({
        title: "Failed!!!",
        text: "Transaction Failed.",
        icon: "warning",
      });
    }
    document.getElementById("form").reset();
  };
  const handleBalCheck = async (e) => {
    e.preventDefault();
    console.log("Bal check mnemonics =", mnemonics);
    try {
      const bal = await getBal(mnemonics);
      console.log("bal =", bal);
      swal({
        title: "Balance",
        text: `Your balance is : ${bal}`,
        icon: "success",
      });
    } catch {
      swal({
        title: "Failed!!!",
        text: "Error getting Balance.",
        icon: "warning",
      });
    }
    document.getElementById("bal-form").reset();
  };
  return (
    <Wrapper>
      <FormWrapper>
        <h1>Wallet Form</h1>
        <Form id="form">
          <FormControl>
            <Form.Control
              type="text"
              placeholder="Receiver's Address"
              size="sm"
              name="Receiver's Address"
              onChange={(e) => setAddress(e.target.value)}
            />
          </FormControl>
          <br />
          <FormControl>
            <Form.Control
              type="text"
              placeholder="Amount"
              size="sm"
              name="Amount"
              onChange={(e) => setAmount(e.target.value)}
            />
          </FormControl>
          <br />
          <FormControl>
            <Form.Control
              type="textarea"
              placeholder="Mnemonics"
              size="sm"
              name="Mnemonics"
              onChange={(e) => setMnemonic(e.target.value)}
            />
          </FormControl>
          <ButtonControl>
            <ButtonSend variant="dark" onClick={handleSend} size="sm">
              Send
            </ButtonSend>
          </ButtonControl>
        </Form>
        <Form id="bal-form">
          <FormControl>
            <Form.Control
              type="text"
              placeholder="Mnemonics"
              size="sm"
              name="Mnemonics"
              onChange={(e) => setMnemonic(e.target.value)}
            />
          </FormControl>
          <ButtonControl>
            <ButtonSend variant="dark" onClick={handleBalCheck} size="sm">
              Check Balance
            </ButtonSend>
          </ButtonControl>
        </Form>
      </FormWrapper>
    </Wrapper>
  );
};

export default Bchwallet;

const Wrapper = styled.div`
  padding: 30px 0px;
  display: flex;
  flex-direction: row;
  @media (max-width: 768px) {
    padding: 0;
    margin: 0;
  }
  input::placeholder,
  textarea::placeholder {
    color: rgb(221, 221, 221);
  }
`;

const FormWrapper = styled.div`
  margin: auto;
`;

const FormControl = styled.div`
  margin: auto;
  text-align: center;
  border: 1px solid #113d8a;
  box-sizing: border-box;
  border-radius: 5px;
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: none;
  }
  > input {
    border-radius: 5px;
    font-size: 16px;
    padding: 10px 15px;
    border: none;
  }
  > textarea {
    resize: none;
    border-radius: 5px;
    font-size: 16px;
    padding: 10px 15px;
    width: 100%;
    height: 287px;
  }
`;

// const FormControlArea = styled.div`
//   margin: auto;
//   height: 100px;
//   text-align: center;
//   border: 1px solid #113d8a;
//   box-sizing: border-box;
//   border-radius: 5px;
//   input[type="number"]::-webkit-outer-spin-button,
//   input[type="number"]::-webkit-inner-spin-button {
//     -webkit-appearance: none;
//     margin: 0;
//   }
//   input[type="number"] {
//     -moz-appearance: none;
//   }
//   > input {
//     border-radius: 5px;
//     font-size: 16px;
//     padding: 10px 15px;
//     border: none;
//   }
//   > textarea {
//     resize: none;
//     border-radius: 5px;
//     font-size: 16px;
//     padding: 10px 15px;
//     width: 100%;
//     height: 287px;
//   }
// `;

const ButtonControl = styled.div`
  padding-top: 30px;
  padding-bottom: 40px;
  text-align: center;
  @media (max-width: 768px) {
    text-align: center;
    padding-top: 10px;
  }
`;
const ButtonSend = styled(Button)`
  padding: 10px 45px;
  border-radius: 10px;
  color: #fff;
  border: none;
  background: #1240c2;
  text-align: center;
  @media (max-width: 768px) {
    margin: 50px 0;
  }
`;
