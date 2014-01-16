/*
 * Copyright (C) 2003-2014 eXo Platform SAS.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
package org.exoplatform.wiki.rendering.widget;

import java.io.StringReader;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.commons.lang3.StringUtils;
import org.exoplatform.wiki.rendering.RenderingService;
import org.exoplatform.wiki.rendering.plugin.widget.WidgetPlugin;
import org.exoplatform.wiki.rendering.util.Utils;
import org.exoplatform.wiki.service.WikiRestService;
import org.exoplatform.wiki.tree.JsonNodeData;
import org.exoplatform.wiki.tree.TreeNode.TREETYPE;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xwiki.xml.html.HTMLCleaner;
import org.xwiki.xml.html.HTMLCleanerConfiguration;
import org.xwiki.xml.html.HTMLUtils;


/**
 * Created by The eXo Platform SAS
 * Author : eXoPlatform
 *          exo@exoplatform.com
 * Jan 16, 2014  
 */
public class ChildrenWidgetPlugin extends WidgetPlugin {

  private String widgetDivClass = "children-content";
  
  public String getWidgetDivClass() {
    return widgetDivClass;
  }
  
  public void setWidgetDivClass(String value) {
    this.widgetDivClass = value;
  }
  
  private String convertHtml(String source, boolean encode) throws Exception {
    if (source.contains(widgetDivClass)) {
      RenderingService renderService = Utils.getService(RenderingService.class);
      HTMLCleaner cleaner = renderService.getComponent(HTMLCleaner.class);
      HTMLCleanerConfiguration config = cleaner.getDefaultConfiguration();
      Document doc = cleaner.clean(new StringReader(source), config);
      
      Map<String, String> map = new HashMap<String, String>();
      travel(doc.getDocumentElement(), encode, map);
      String ret = HTMLUtils.toString(doc, true, true).replace("<html>", "").replace("</html>", "");
      for (Entry<String, String> entry : map.entrySet()) {
        ret = ret.replace(entry.getKey(), entry.getValue());
      }
      return ret;
    } else return source;    
  }
  
  private void travel(Element elem, boolean encode, Map<String, String> map) {
    if (elem.hasAttribute("class") && elem.getAttribute("class").contains(widgetDivClass)) {
      if (encode) {
        elem.setTextContent("zero");
      } else {
        String stChildrenNum = elem.getAttribute("childrennum");
        int childrenNum = StringUtils.isBlank(stChildrenNum) ? 100 : Integer.parseInt(stChildrenNum);
        
        String stDepth = elem.getAttribute("depth");
        int depth =  StringUtils.isBlank(stDepth) ? 100 : Integer.parseInt(stDepth);
        
        String stDescendant = elem.getAttribute("descendant");
        boolean descendant = StringUtils.isBlank(stDescendant) || "yes".equalsIgnoreCase(stDescendant);

        String stExcerpt = elem.getAttribute("excerpt");
        boolean excerpt = StringUtils.isBlank(stExcerpt) || "yes".equalsIgnoreCase(stExcerpt);
        
        String parent = elem.getAttribute("parent");
        
        try {
          List<JsonNodeData> data = Utils.getService(WikiRestService.class)
               .getTreeDataNodes(TREETYPE.CHILDREN.toString(), 
                                 elem.getAttribute("type") + "/" + elem.getAttribute("owner") + "/" + parent, 
                                 "", excerpt, stDepth, descendant);
          String key = "" + System.currentTimeMillis() + (int)(Math.random() * 1000000);
          elem.setTextContent(key);
          map.put(key, getChildrenAsHTML(data, childrenNum));
        } catch (Exception e) {
          //Log
        }
        
      }
    } else {
      NodeList list = elem.getChildNodes();
      for (int i = 0; i < list.getLength(); i++) {
        if (list.item(i) instanceof Element) {
          travel((Element)list.item(i), encode, map);
        }
      }
    }
  }
  
  private String getChildrenAsHTML(List<JsonNodeData> data, int childrenNum) {
    StringBuilder ret  = new StringBuilder("<ul>");
    int i = 0;
    for (JsonNodeData node : data) {
      if (++i == childrenNum) break;
      ret.append(generateTree(node));
    }
    ret.append("</ul>");
    return ret.toString();
  }
  
  private String generateTree(JsonNodeData node) {
    StringBuilder ret = new StringBuilder("<li>");
    ret.append("<span class='wikilink'>");
    String path = node.getPath();
    ret.append("<a href='").append(path.substring(path.lastIndexOf("/") + 1)).append("'>");
    ret.append(node.getName()); 
    ret.append("</a>");
    ret.append("</span>");
    for (JsonNodeData child : node.getChildren()) {
      ret.append("<ul>").append(generateTree(child)).append("</ul>");
    }
    return ret.append("</li>").toString();
  }

  @Override
  public String encodeHtml(String source) throws Exception {
    return convertHtml(source, true);
  }
  @Override
  public String decodeHtml(String source) throws Exception {
    return convertHtml(source, false);
  }

}
