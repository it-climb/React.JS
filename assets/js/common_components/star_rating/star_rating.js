'use strict';
import React from "react";
import _ from "lodash";

export default React.createClass({
    propTypes: {
        rating: React.PropTypes.number.isRequired,
        label: React.PropTypes.string.isRequired,
        readOnly: React.PropTypes.bool,
        selectCallback: React.PropTypes.func,
    },
    getDefaultProps(){
        return {
            readOnly: true, selectCallback: (rating, label)=> {
            }
        };
    },
    _ratingChanged(value){
        if (this.props.readOnly) {
            return;
        }
        this.props.selectCallback(value, this.props.label);
    },

    render(){
        let {rating, label, readOnly} = this.props;

        return <div className='test-rating-entry'>
            <span className="rating-label">{label}</span>
            <span className={`rate-stars ${readOnly ? '' : 'editable'}`}>
            {
                _.range(5).map(key=> {
                    let classes = ['glyph-star', (rating >= (key + 1) ? 'full' : '')];
                    return <span className={classes.join(' ')} title={`${key+1} star${key==0?'':'s'}`}
                                 onClick={this._ratingChanged.bind(this, key + 1)}/>;
                })
            }
            </span>
        </div>
    }
});