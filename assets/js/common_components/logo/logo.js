'use strict';
import React from "react";
import _ from "lodash";
import urlUtils from '../../utils/url_utils';

const defaultLogoPath = "/assets/images/default_logo.png";
export default React.createClass({
    propTypes: {
        entry: React.PropTypes.object.isRequired,
        big: React.PropTypes.bool,
        classes: React.PropTypes.array
    },
    getDefaultProps(){
        return {big: false, classes: []};
    },
    getInitialState(){
        return {localSrc: ''};
    },
    componentWillReceiveProps(){
        let {entry} = this.props;
        if (!entry||!entry.logo) {
            return;
        }
        let fileReader = new FileReader(),
            that = this;
        fileReader.onloadend = () => that.setState({localSrc: fileReader.result});
        fileReader.readAsDataURL(entry.logo);
    },

    _getClassesString(isDefault = false){
        return [(this.props.big ? 'test-entry-logo-big' : 'test-entry-logo-small'), (isDefault ? 'test-entry-logo-default' : '')].concat(this.props.classes).join(' ');
    },
    _getDefaultLogo(){
        return <img className="img-responsive img-circle default-logo" src={defaultLogoPath} alt="No Image"/>
    },
    _getLogoFor(logo){
        return <img className="img-responsive img-circle" src={`${urlUtils.getImagesUrl(logo)}`} alt={logo.name}/>
    },
    _showLocalLogo(){
        let {localSrc} = this.state;
        return <img className="img-responsive img-circle" src={localSrc || defaultLogoPath}/>
    },
    render(){
        let Logo = _.get(this.props.entry, 'Logo', {}),
            localLogo = _.get(this.props.entry, 'logo', null),
            useDefault = !((Logo && Logo.id) || localLogo);
        return <div className="test-entry-logo">
            <div className={this._getClassesString(useDefault)}>
                {
                    useDefault
                        ? this._getDefaultLogo()
                        : (
                        localLogo
                            ? this._showLocalLogo(localLogo)
                            : this._getLogoFor(Logo)
                    )
                }
            </div>
        </div>;
    }
});