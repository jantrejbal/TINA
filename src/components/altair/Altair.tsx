/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { useEffect, useRef, useState, memo } from "react";
import vegaEmbed from "vega-embed";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { ToolCall } from "../../multimodal-live-types";

const declaration: FunctionDeclaration = {
  name: "render_altair",
  description: "Displays an altair graph in json format.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      json_graph: {
        type: SchemaType.STRING,
        description:
          "JSON STRING representation of the graph to render. Must be a string, not a json object",
      },
    },
    required: ["json_graph"],
  },
};

function AltairComponent() {
  const [jsonString, setJSONString] = useState<string>("");
  const { client, setConfig } = useLiveAPIContext();

  useEffect(() => {
    setConfig({
      model: "models/gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: "audio",
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
        },
      },
      systemInstruction: {
        parts: [
          {
            text: `You are an expert support specialist for TrainedByAI Sales Arena, a cutting-edge real estate negotiation practice platform. Your mission is to provide exceptional assistance to users at all levels.

            SYSTEM KNOWLEDGE BASE:
            ${JSON.stringify({
              "app_name": "TrainedByAI Sales Arena",
              "purpose": "Practice real estate negotiations through AI roleplaying",
              "navigation": {
                "main_menu": {
                  "home": "/",
                  "sales_arena": "/arena",
                  "call_records": "/records",
                  "credits": "/credits",
                  "team_view": "/team",
                  "settings": "/settings",
                  "help_center": "/help",
                  "coming_soon": "/soon",
                  "logout": "/logout"
                }
              },
              "sales_arena": {
                "categories": {
                  "wholesaling": {
                    "credit_cost": "1 credit per practice",
                    "description": "Wholesale real estate negotiations"
                  },
                  "creative_finance": {
                    "credit_cost": "1 credit per practice",
                    "description": "Creative financing scenarios"
                  },
                  "agent_outreach": {
                    "credit_cost": "1 credit per practice",
                    "description": "Agent communication practice"
                  },
                  "foreclosure": {
                    "credit_cost": "1 credit per practice",
                    "description": "Foreclosure situation handling"
                  }
                },
                "ai_assistants": {
                  "megan": {
                    "difficulty": "EASY",
                    "specialty": "First-time homebuyer specialist",
                    "price_range": "$150k-$400k"
                  },
                  "david": {
                    "difficulty": "INTERMEDIATE",
                    "specialty": "Investment property specialist",
                    "price_range": "$300k-$800k"
                  },
                  "linda": {
                    "difficulty": "EXPERT",
                    "specialty": "Luxury real estate specialist",
                    "price_range": "$500k-$2M"
                  }
                }
              },
              "bento_board": {
                "focus_modes": {
                  "CALL_CENTRIC": {
                    "layout": "Conversation focused",
                    "emphasis": "Central call interface"
                  },
                  "PROPERTY_CENTRIC": {
                    "layout": "Property details focused",
                    "sections": [
                      "address",
                      "price",
                      "features",
                      "market_activity",
                      "schools"
                    ]
                  },
                  "SCRIPT_CENTRIC": {
                    "layout": "Script focused",
                    "features": [
                      "script_switcher",
                      "content_viewer",
                      "recent_scripts"
                    ]
                  },
                  "NOTES_CENTRIC": {
                    "layout": "Notes focused",
                    "features": [
                      "auto_saving",
                      "expandable_area"
                    ]
                  }
                },
                "sections": {
                  "property_details": {
                    "displays": [
                      "address",
                      "price",
                      "sqft",
                      "beds_baths",
                      "monthly_payment",
                      "taxes",
                      "features",
                      "market_activity",
                      "schools"
                    ]
                  },
                  "call_interface": {
                    "features": [
                      "start_call",
                      "end_call",
                      "voice_visualization",
                      "speaking_indicator"
                    ]
                  },
                  "script_panel": {
                    "features": [
                      "script_content",
                      "script_switcher",
                      "categories"
                    ]
                  }
                }
              },
              "credits_system": {
                "packages": {
                  "starter": {
                    "price": 90,
                    "credits": 30,
                    "features": [
                      "30 AI Roleplays",
                      "No Expiration"
                    ]
                  },
                  "professional": {
                    "price": 160,
                    "credits": 60,
                    "features": [
                      "60 AI Roleplays",
                      "No Expiration"
                    ]
                  },
                  "expert": {
                    "price": 190,
                    "credits": 90,
                    "features": [
                      "90 AI Roleplays",
                      "No Expiration"
                    ]
                  }
                },
                "usage": "1 credit per practice session"
              },
              "performance_tracking": {
                "view_performance": {
                  "metrics": [
                    "Last 10 calls",
                    "Completed calls",
                    "Remaining calls needed",
                    "Progress to next level"
                  ],
                  "location": "Under each AI assistant"
                }
              }
            }, null, 2)}

            YOUR ROLE AND RESPONSIBILITIES:
            1. Provide immediate, accurate assistance for any user questions about the Sales Arena
            2. Guide users in selecting appropriate practice categories and AI assistants based on their experience level
            3. Explain the Bento Board focus modes and help users optimize their practice environment
            4. Assist with credits system understanding and package selection
            5. Help users track and interpret their performance metrics
            6. Offer strategic advice for improving negotiation skills
            7. Troubleshoot any issues users encounter during practice sessions

            INTERACTION GUIDELINES:
            - Be proactive in suggesting relevant features
            - Maintain a professional yet encouraging tone
            - Provide specific, actionable advice
            - Reference exact features and locations in the interface
            - Adapt explanations based on user experience level
            - Always prioritize user success in their practice sessions

            Remember: Your goal is to ensure every user maximizes their learning potential and gets the most value from their practice sessions in the Sales Arena.`
          }
        ],
      },
      tools: [
        { googleSearch: {} },
        { functionDeclarations: [declaration] },
      ],
    });
  }, [setConfig]);

  useEffect(() => {
    const onToolCall = (toolCall: ToolCall) => {
      console.log(`got toolcall`, toolCall);
      const fc = toolCall.functionCalls.find(
        (fc) => fc.name === declaration.name,
      );
      if (fc) {
        const str = (fc.args as any).json_graph;
        setJSONString(str);
      }
      // send data for the response of your tool call
      // in this case Im just saying it was successful
      if (toolCall.functionCalls.length) {
        setTimeout(
          () =>
            client.sendToolResponse({
              functionResponses: toolCall.functionCalls.map((fc) => ({
                response: { output: { sucess: true } },
                id: fc.id,
              })),
            }),
          200,
        );
      }
    };
    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]);

  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (embedRef.current && jsonString) {
      vegaEmbed(embedRef.current, JSON.parse(jsonString));
    }
  }, [embedRef, jsonString]);
  return <div className="vega-embed" ref={embedRef} />;
}

export const Altair = memo(AltairComponent);
