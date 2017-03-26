'use strict';
import _ from "lodash";
import FeeHolder from './fee_holder';

const BidsUtils = {

    calculateBankFee(bid) {
        let bankPercent = FeeHolder.getBankFeePercent(),
            fee = bid * bankPercent / 100,
            amount = bid - fee;
        return {
            fee,
            amount
        }
    },
    calculateClientFee(bid) {
        let bankPercent = FeeHolder.getBankFeePercent(),
            fee = bid * bankPercent / 100,
            amount = bid + fee;
        return {
            fee,
            amount
        }
    }
};

export default BidsUtils;