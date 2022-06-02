import React, { Component } from 'react';
import axios from 'axios';

class Fib extends Component { 
    state = {
        seenIndexes: [],
        values: {},
        index: ''
    };

    componentDidMount() { 
        this.fetchValues();
        this.fetchIndexes();
    }

    async fetchValues () { 
        console.log('Starting to fetch values...')
        const values = await axios.get('/api/values/current');
        this.setState({
            values: values.data
        });
    }

    async fetchIndexes () {
        console.log('Starting to fetch indexes');
        const indexes = await axios.get('/api/values/all');
        this.setState({
            seenIndexes: indexes.data
        });
    }

    handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!this.state.index) {
            alert('Please enter an index');
            return;
        }
        await axios.post('/api/values', {
            index: this.state.index
        });
        this.setState({
            index: ''
        });
    };

    indexChange = (e) => { 
        e.preventDefault();
        this.setState({
            index: e.target.value
        });
    };

    renderSeenIndexes() { 
        return this.state.seenIndexes.map(item => item.number).join(', ');
    };

    renderValues = () => { 
        const entries = [];
        for(let key in this.state.values) {
            entries.push(
                <div key={key}>
                    For index {key} I calculated {this.state.values[key]}
                </div>
            );
        }
        return entries;
    }

    render() { 
        return (
            <div style={{ margin: 10 }}>
                <form onSubmit={this.handleFormSubmit}>
                    <label>Enter your index</label>
                    <input value={this.state.index} onChange={this.indexChange}/>
                    <button>Submit</button>
                </form>
                <h3>Indexes that I have seen:</h3>
                    {this.renderSeenIndexes()}
                <h3>Calculated values:</h3>
                    {this.renderValues()}
            </div>
        );
    }
}

export default Fib;