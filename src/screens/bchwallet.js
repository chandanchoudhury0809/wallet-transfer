import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Form, Button } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Swal from "sweetalert2";
import { sendBch } from "../functions/bch2";
import { getBchAccountBalance } from "../functions/bch2";
import Spinner from "react-bootstrap/Spinner";
import { getFee } from "../functions/bch2";

function Spin() {
  return (
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  );
}
const Bchwallet = () => {
  const [raddress, setRaddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saddress, setSaddress] = useState("");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState("0");
  const [mnemonics, setMnemonic] = useState("");
  useEffect(() => {
    try {
      const getBalance = async () => {
        const balance = await getBchAccountBalance(saddress, false);
        setBalance(balance.toString());
        console.log("Here is the balance", balance.toString());
      };
      getBalance();
    } catch (err) {
      Swal.fire({
        title: "Failed!!!",
        text: err.message,
        icon: "error",
      });
      setBalance(0);
    }
  }, [saddress]);
  const handleSend = async (e) => {
    let amount_to_transfer_trimmed = String(parseFloat(amount).toFixed(7));
    const bal = await getBchAccountBalance(saddress);
    let selbal = String(parseFloat(bal).toFixed(7));
    e.preventDefault();
    try {
      console.log("address =", raddress);
      console.log("amount =", raddress);
      console.log("mnemonics =", mnemonics);
      const txid = await sendBch(
        saddress,
        raddress,
        amount_to_transfer_trimmed,
        selbal,
        mnemonics,
      );
      Swal.fire({
        title: "Sent!!!",
        text: `Transaction successful. Transaction ID : ${txid}`,
        icon: 'success',
      })
    } catch {
      Swal.fire({
        title: "Failed!!!",
        text: "Transaction Failed.",
        icon: "error",
      });
    }
    document.getElementById("form").reset();
  };
  const handleBalCheck = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Bal check mnemonics =", mnemonics);
    try {
      // const bal = await getBal(mnemonics);
      const bal = await getBchAccountBalance(raddress);
      console.log("bal =", bal);
      Swal.fire({
        title: "Balance",
        text: `Your balance is : ${bal} BCH`,
        icon: "success",
      });
      setIsLoading(false);
    } catch {
      Swal.fire({
        title: "Failed!!!",
        text: "Error getting Balance.",
        icon: "warning",
      });
    }
    document.getElementById("bal-form").reset();
  };
  const handleMax = async (e) => {
    const bal = await getBchAccountBalance(saddress);
    const fee = await getFee();
    let selbal = String(parseFloat(bal).toFixed(7));
    const maxamt = bal - fee.safe;
    e.preventDefault();
    try {
      console.log(fee.safe + "fee");
      Swal.fire({
        title: 'Are you sure?',
        text: `Your Max Amount is : ${maxamt} BCH`,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Send',
        denyButtonText: `Don't send`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          async function send() {
            const txid = await sendBch(
              saddress,
              raddress,
              maxamt,
              selbal,
              mnemonics,
            );
            Swal.fire({
              title: "Sent!!!",
              text: `Transaction successful. Transaction ID : ${txid}`,
              icon: 'success',
            })
          }
          send();
        } else if (result.isDenied) {
          Swal.fire('Changes are not saved', '', 'info')
        }
      })
    } catch {
      Swal.fire({
        title: "Failed!!!",
        text: "Transaction Failed.",
        icon: "error",
        html: `<p>Fee : ${fee.safe}</p><p>Balance : ${bal} <br> Max Amount : ${maxamt} <br> ${e.message} </p>
        </p>`

      });
    }
    document.getElementById("form").reset();
  };
  return (
    <>
      <Wrapper>
        <FormWrapper>
          <Card border="primary" style={{ width: "36rem" }}>
            <Card.Body>
              <Card.Title>
                {" "}
                <h1>Wallet Pay</h1>
              </Card.Title>
              <Card.Text>
                Send BCH to any address.
              </Card.Text>
            </Card.Body>
            <ListGroup className="list-group-flush">
              <Form id="form">
                <FormControl>
                  <Form.Control
                    type="text"
                    placeholder="Sender's Address"
                    size="sm"
                    name="Receiver's Address"
                    onChange={(e) => setSaddress(e.target.value)}
                  />
                </FormControl>
                <br />
                <ListGroup.Item>Balance: {balance}</ListGroup.Item>
                <br />
                <FormControl>
                  <Form.Control
                    type="text"
                    placeholder="Receiver's Address"
                    size="sm"
                    name="Receiver's Address"
                    onChange={(e) => setRaddress(e.target.value)}
                  />
                </FormControl>
                <br />
                <FormControl>
                  <Form.Control
                    type="text"
                    placeholder="Amount to Send"
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
                  <br />
                  <ButtonSend
                    variant="light"
                    onClick={handleMax}
                    size="sm"
                    style={{ marginTop: "10px" }}
                  >
                    Send Max
                  </ButtonSend>
                </ButtonControl>
              </Form>
            </ListGroup>
            <Card.Body>
              <Form id="bal-form">
                <FormControl>
                  <Form.Control
                    type="text"
                    placeholder="Address"
                    size="sm"
                    name="Address"
                    onChange={(e) => setRaddress(e.target.value)}
                  />
                </FormControl>
                <ButtonControl>
                  <ButtonSend
                    variant="light"
                    onClick={handleBalCheck}
                    size="sm"
                  >
                    {isLoading ? <Spin /> : "Check Balance"}
                  </ButtonSend>
                </ButtonControl>
              </Form>
            </Card.Body>
          </Card>
        </FormWrapper>
      </Wrapper>
    </>
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
  padding: 20px;
  border: 3px solid #000000;
  border-radius: 10px;
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
const ButtonControl1 = styled.div`
padding-top: 10px;  
padding-bottom: 10px;
  text-align: right;
  @media (max-width: 768px) {
    text-align: center;
    padding-top: 10px;
  }
`;
const ButtonSend = styled(Button)`
  padding: 10px 45px;
  border-radius: 10px;
  color: #ffffff;
  border: none;
  background: #1240c2;
  text-align: center;
  @media (max-width: 768px) {
    margin: 50px 0;
  }
  :hover {
    color: pink;
  }
`;
